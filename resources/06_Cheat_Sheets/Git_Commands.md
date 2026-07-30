# Git Commands

## Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## Verify Configuration

```bash
git config --global user.name
git config --global user.email
```

## Initialize Repository

```bash
git init
```

## Check Status

```bash
git status
```

## Stage Files

```bash
git add README.md
git add .
```

## Commit

```bash
git commit -m "message"
```

## View Commit History

```bash
git log
```

## Branches

```bash
git branch
git branch -M main
```

## Remote Repository

```bash
git remote add origin <repository-url>
git remote -v
```

## Push

```bash
git push -u origin main
git push
```