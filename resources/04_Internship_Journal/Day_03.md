# Day 03 - Git Repository & GitHub

## Topics Covered

- Configured Git username and email.
- Initialized a Git repository using `git init`.
- Learned the purpose of the hidden `.git` folder.
- Understood the Working Directory, Staging Area, and Git Repository.
- Learned how to use `git status`.
- Staged files using `git add` and `git add .`.
- Created the first Git commit using `git commit -m`.
- Viewed commit history using `git log`.
- Learned about Commit Hash and HEAD.
- Understood Git Branches and renamed `master` to `main`.
- Connected the local repository to GitHub using `git remote`.
- Pushed the project to GitHub using `git push -u origin main`.

---

## Commands Practiced

```bash
git config --global user.name
git config --global user.email
git init
git status
git add README.md
git add .
git commit -m "chore: initialize project documentation"
git log
git branch
git branch -M main
git remote add origin <repository-url>
git remote -v
git push -u origin main
```

---

## What I Learned

- Git tracks project history using commits.
- The `.git` folder contains Git metadata.
- Files move from the Working Directory to the Staging Area before being committed.
- Every commit has a unique Commit Hash.
- HEAD points to the current commit.
- Branches allow independent development without affecting the main branch.
- GitHub stores a remote copy of the project.
- `origin` is the default name of the remote repository.
- `git push` uploads commits to GitHub.

---

## Challenges Faced

- Initially ran Git commands outside the project folder.
- Learned to verify the current directory before running Git commands.
- Understood the difference between saving a file (`Ctrl + S`) and creating a Git commit.

---

## Reflection

Today I completed my first complete Git workflow, from creating a repository to successfully pushing my project to GitHub. I now understand how Git tracks changes and how GitHub stores the project online.