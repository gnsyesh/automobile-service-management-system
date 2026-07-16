# Git

> **Lesson ID:** L001  
> **Sprint:** Sprint 0 – Foundation & Planning  
> **Topic:** Git & Version Control  
> **Date:** 14-07-2026  
> **Duration:** 1 Hour

---

# Lesson Objective

By the end of this lesson, I should be able to:

- Explain what Version Control is.
- Explain what Git is.
- Explain why Git was created.
- Differentiate between Git and GitHub.
- Explain what a Repository is.
- Explain what a Commit is.
- Understand why every software company uses Git.

---

# Why Am I Learning This?

As a Web Development Intern, I will continuously modify the project's code. Without a proper system, I could accidentally lose my work or overwrite someone else's changes.

Git helps developers:

- Track every meaningful change.
- Restore previous versions.
- Collaborate with team members.
- Maintain a complete project history.

Git is one of the most important tools used in software development, and almost every software company uses it.

---

# What Problem Does Git Solve?

Imagine I build the Homepage today.

Tomorrow I change some code.

Suddenly the Homepage stops working.

Without Git:

- I don't know what caused the issue.
- I cannot return to yesterday's working version.
- I might have to rewrite the code.

Git solves this problem by saving snapshots of my project over time. If something breaks, I can return to an earlier working version.

---

# What is Version Control?

### Definition

Version Control is a system that records changes made to files over time. It allows developers to track, manage, compare, and restore different versions of a project.

### Why is it important?

- Keeps history of changes.
- Allows developers to undo mistakes.
- Makes teamwork easier.
- Prevents code loss.

### Example

Instead of creating folders like:

Project_Final

Project_Final2

Project_Final_Last

Project_Final_Final

Git stores all versions automatically.

---

# What is Git?

### Definition

Git is a Distributed Version Control System (DVCS) that tracks changes in files and allows developers to manage different versions of a project efficiently.

### Important Points

- Git is free and open source.
- Git works offline.
- Git keeps the complete history of the project.
- Git allows multiple developers to work on the same project.
- Git helps restore previous versions whenever required.

---

# Why Was Git Created?

Before Git, developers managed projects by copying folders or emailing ZIP files.

This caused several problems:

- Multiple versions of the same project.
- Lost code.
- Difficult collaboration.
- No proper history.

Git was created by Linus Torvalds in 2005 to solve these problems and provide a fast, reliable version control system.

---

# Git vs GitHub

| Git | GitHub |
|------|---------|
| Software | Cloud platform |
| Installed on my computer | Website |
| Tracks versions | Stores Git repositories online |
| Works without internet | Internet required for syncing |
| Created by Linus Torvalds | Owned by Microsoft |

---

# Important Terms Learned Today

## Version Control

A system that records changes made to files over time.

---

## Repository (Repo)

A repository is a project that is being tracked by Git.

Example:

Automobile Service Management System Repository

---

## Commit

A commit is a snapshot of a project's meaningful state along with a message describing what changed.

Example:

feat: implement responsive homepage layout

---

## Snapshot

A snapshot is the exact state of the project at a specific point in time.

Think of it like saving progress in a game.

---

# Real-World Example

Suppose I am developing the Automobile Service Management System.

Day 1

Create Homepage

Commit:

feat: create homepage

---

Day 2

Add Navigation Bar

Commit:

feat: implement responsive navigation bar

---

Day 3

Build Login Page

Commit:

feat: build customer login page

---

Day 4

A bug appears.

Instead of rebuilding everything, Git allows me to return to the working version from Day 3.

---

Conventional Commits standard prefixes:-
| Prefix      | Meaning                                | Example                                    |
| ----------- | -------------------------------------- | ------------------------------------------ |
| `feat:`     | New feature                            | `feat: add appointment booking form`       |
| `fix:`      | Bug fix                                | `fix: resolve login validation issue`      |
| `docs:`     | Documentation                          | `docs: update project roadmap`             |
| `style:`    | Formatting/UI only                     | `style: improve button spacing`            |
| `refactor:` | Improve code without changing behavior | `refactor: simplify booking service logic` |
| `test:`     | Tests                                  | `test: add booking API unit tests`         |
| `chore:`    | Maintenance/configuration              | `chore: configure ESLint`                  |


# Common Mistakes Beginners Make

❌ Writing commit messages like:

Final

Updated

Changes

Latest

Done

---

Instead write:

✔ feat: add appointment booking page

✔ fix: resolve login validation issue

✔ docs: update project roadmap

✔ style: improve homepage layout

---

# Interview Questions

## Q1. What is Version Control?

Answer:

Version Control is a system that records and manages changes made to files over time. It allows developers to track history, restore previous versions, and collaborate efficiently.

---

## Q2. What is Git?

Answer:

Git is a Distributed Version Control System (DVCS) used to track changes in source code, maintain project history, and enable collaboration among developers.

---

## Q3. Why do software companies use Git?

Answer:

Companies use Git because it helps developers collaborate safely, maintain project history, recover previous versions, manage code efficiently, and reduce the risk of losing work.

---

## Q4. What is the difference between Git and GitHub?

Answer:

Git is software installed on a computer that tracks changes in a project.

GitHub is an online platform used to host Git repositories, collaborate with teams, and back up projects.

---

## Q5. What is a Repository?

Answer:

A repository is a project that Git tracks. It contains all the project files and the complete history of changes.

---

## Q6. What is a Commit?

Answer:

A commit is a snapshot of a project's meaningful state along with a descriptive message explaining what changed.

---

# Summary

Today I learned:

- What Version Control is.
- What Git is.
- Why Git was created.
- The difference between Git and GitHub.
- What a Repository is.
- What a Commit is.
- How commit messages should be written.

---

# Key Takeaways

1. Git is a Version Control System.
2. Git stores the history of my project.
3. Every commit should represent one meaningful change.

---




# Lesson 2 – Git Workflow

> **Lesson ID:** L002
> **Topic:** Git Workflow
> **Date:** 15-07-2026

---

# Learning Objectives

By the end of this lesson, I should understand:

- What happens after pressing Ctrl + S
- The Git workflow
- What the Staging Area is
- The purpose of git add
- The purpose of git commit
- The purpose of git push

---

# What Happens After Pressing Ctrl + S?

When I press **Ctrl + S**, my file is saved only on my computer.

Git does not automatically save or track my changes.

Git only starts tracking changes after I use Git commands.

---

# Git Workflow

The Git workflow is the process of saving, tracking, and sharing changes.

The workflow is:

Edit Code

↓

Ctrl + S

↓

Saved on Computer

↓

git add

↓

Staging Area

↓

git commit

↓

Local Git Repository

↓

git push

↓

GitHub Repository

---

# Staging Area

The Staging Area is a temporary area where Git keeps files before creating a commit.

It allows developers to select which files should be included in the next commit.

Think of it as a waiting room before creating a snapshot.

---

# git add

Definition:

The `git add` command moves modified files into the Staging Area.

Purpose:

- Prepare files for commit.
- Select which changes should be committed.

Example:

```bash
git add .
```

---

# git commit

Definition:

A commit creates a snapshot of the project's current state along with a descriptive message.

Purpose:

- Save meaningful changes.
- Maintain project history.

Example:

```bash
git commit -m "feat: build homepage"
```

---

# git push

Definition:

The `git push` command uploads local commits to GitHub.

Purpose:

- Backup the project.
- Share changes with other developers.

Example:

```bash
git push
```

---


# Common Mistakes

❌ Thinking Ctrl + S saves files to Git.

Reality:

Ctrl + S only saves files on the computer.

Git starts tracking changes only after `git add`.

---

# Summary

Today I learned:

- Ctrl + S saves files only on my computer.
- Git follows the workflow: Save → Stage → Commit → Push.
- The Staging Area prepares files for commit.
- A commit creates a snapshot.
- GitHub stores my repository online.