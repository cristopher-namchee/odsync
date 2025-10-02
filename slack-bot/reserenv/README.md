# Reserenv

A slack bot that shows GLChat environment usage.

> [!WARNING]
> This bot doesn't correctly synchronize with infra. Therefore, the environment user might be inaccurate!

## Supported Environments

1. `dev`
2. `dev2`
3. `dev3`

> [!NOTE]
> Other env(s) support will be decided later.

## Commands

### `/reserve <environment>`

Reserve an environment under your name.

This action will fail under the following circumstances:

1. The environment is not supported
2. It's being reserved by other users or **you**

### `/unreserve <environment>`

Unreserve an environment.

This action will fail under the following circumstances:

1. The environment is not supported
2. It's being reserved by other users or **you**
