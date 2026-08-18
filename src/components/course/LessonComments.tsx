"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Trash2, User, Reply, CornerDownRight } from "lucide-react";
import { addComment, getCommentsByLesson, deleteComment } from "@/actions/comments";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  parentId: string | null;
  user: {
    name: string;
    image: string | null;
  };
};

export function LessonComments({ lessonId, currentUserId }: { lessonId: string, currentUserId?: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [lessonId]);

  async function loadComments() {
    setLoading(true);
    try {
      const data = await getCommentsByLesson(lessonId);
      setComments(data as any);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent, parentId?: string) {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await addComment(lessonId, content, parentId);
      if (result.success) {
        if (parentId) {
          setReplyContent("");
          setReplyTo(null);
        } else {
          setNewComment("");
        }
        loadComments();
        toast.success("Komentar terkirim!");
      }
    } catch (error) {
      toast.error("Gagal mengirim komentar");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus komentar ini?")) return;
    
    try {
      await deleteComment(id);
      loadComments();
      toast.success("Komentar dihapus");
    } catch (error) {
      toast.error("Gagal menghapus komentar");
    }
  }

  // Group comments by parentId
  const mainComments = comments
    .filter(c => !c.parentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const replies = comments
    .filter(c => c.parentId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="space-y-8 pt-8 border-t">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-5 text-primary" />
        <h3 className="text-xl font-bold">Diskusi Pelajaran</h3>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Tanyakan sesuatu atau berikan masukan..."
          className="w-full min-h-[100px] p-4 rounded-2xl border bg-muted/30 focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? "Mengirim..." : (
              <>
                Kirim Komentar
                <Send className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="space-y-8">
        {loading ? (
          <div className="space-y-4">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-muted/50 animate-pulse" />
             ))}
          </div>
        ) : mainComments.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-3xl">
            Belum ada diskusi. Jadilah yang pertama bertanya!
          </div>
        ) : (
          mainComments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <div className="flex gap-4 group">
                <div className="shrink-0">
                  {comment.user.image ? (
                    <img src={comment.user.image} className="size-10 rounded-full object-cover border" alt="" />
                  ) : (
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center border">
                      <User className="size-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm mr-2">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: id })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className="p-2 text-muted-foreground hover:text-primary transition-all flex items-center gap-1 text-xs font-bold"
                      >
                        <Reply className="size-3" />
                        Balas
                      </button>
                      {currentUserId === comment.userId && (
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-sm leading-relaxed">
                    {comment.content}
                  </div>

                  {/* Reply Form */}
                  {replyTo === comment.id && (
                    <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4 space-y-3">
                       <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Tulis balasan..."
                        autoFocus
                        className="w-full min-h-[80px] p-3 rounded-xl border bg-muted/50 focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none text-sm"
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-lg transition-all"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || !replyContent.trim()}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-primary/20"
                        >
                          Kirim Balasan
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Nested Replies */}
              <div className="ml-12 space-y-4">
                {replies.filter(r => r.parentId === comment.id).map((reply) => (
                  <div key={reply.id} className="flex gap-4 group">
                    <div className="shrink-0 relative">
                       <CornerDownRight className="absolute -left-6 top-2 size-4 text-muted-foreground/30" />
                       {reply.user.image ? (
                          <img src={reply.user.image} className="size-8 rounded-full object-cover border" alt="" />
                       ) : (
                          <div className="size-8 rounded-full bg-muted flex items-center justify-center border">
                             <User className="size-4 text-muted-foreground" />
                          </div>
                       )}
                    </div>
                    <div className="flex-1 space-y-1">
                       <div className="flex items-center justify-between">
                          <div>
                             <span className="font-bold text-xs mr-2">{reply.user.name}</span>
                             <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: id })}
                             </span>
                          </div>
                          {currentUserId === reply.userId && (
                             <button 
                                onClick={() => handleDelete(reply.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                             >
                                <Trash2 className="size-3" />
                             </button>
                          )}
                       </div>
                       <div className="p-3 rounded-xl bg-muted/20 border border-border/30 text-xs leading-relaxed">
                          {reply.content}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
