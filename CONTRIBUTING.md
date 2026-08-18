# Contributing to Ajar LMS

Thank you for your interest in contributing to Ajar LMS! We welcome contributions from the community to help make online learning more accessible, delightful, and robust.

---

## 🛠️ Development Setup

1. **Fork & Clone** the repository:
   ```bash
   git clone https://github.com/r-iki/Ajar.git
   cd Ajar
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your PostgreSQL `DATABASE_URL` and `BETTER_AUTH_SECRET`.

4. **Initialize the Database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🌿 Branching & Commit Workflow

- **Branch Naming**:
  - `feat/feature-name` for new features
  - `fix/bug-name` for bug fixes
  - `docs/documentation-update` for documentation changes
- **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: add user achievement badge system`
  - `fix: handle edge case in transaction webhook`
  - `docs: update deployment guidelines`

---

## 🧪 Code Quality & Testing

Before submitting a Pull Request, please ensure all checks pass:

```bash
# Verify TypeScript types and build
npm run build

# Run linter
npm run lint
```

---

## 📄 License

By contributing to Ajar LMS, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
