#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import shlex
import subprocess
import sys
from pathlib import Path


def run(cmd: list[str], *, cwd: Path | None = None) -> None:
    rendered = " ".join(cmd)
    print(f"[run] {rendered}")
    subprocess.run(cmd, cwd=str(cwd) if cwd else None, check=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Push current branch to GitHub and deploy on VPS via SSH key.",
    )
    parser.add_argument("--repo", default=".", help="Local repo path (default: current directory).")
    parser.add_argument("--branch", default="main", help="Branch to push/deploy (default: main).")
    parser.add_argument("--remote", default="origin", help="Git remote name (default: origin).")
    parser.add_argument("--vps-user", default="kyaw", help="VPS SSH user (default: kyaw).")
    parser.add_argument("--vps-host", default="38.54.32.58", help="VPS host (default: 38.54.32.58).")
    parser.add_argument(
        "--vps-repo",
        default="/opt/duolingo",
        help="Repo path on VPS (default: /opt/duolingo).",
    )
    parser.add_argument(
        "--skip-push",
        action="store_true",
        help="Skip git push and only run VPS deploy.",
    )
    parser.add_argument(
        "--deploy-env-file",
        default="",
        help="Optional env file to inject on VPS deploy (KEY=VALUE lines).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print actions only, do not execute.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo = Path(args.repo).resolve()
    if not (repo / ".git").exists():
        print(f"[error] Not a git repository: {repo}")
        return 1

    vps_target = f"{args.vps_user}@{args.vps_host}"
    env_assignments = [
        f"DEPLOY_REF={shlex.quote(args.branch)}",
        "SKIP_GIT_PULL=false",
    ]
    if args.deploy_env_file:
        deploy_env_path = Path(args.deploy_env_file).resolve()
        if not deploy_env_path.is_file():
            print(f"[error] deploy env file not found: {deploy_env_path}")
            return 1
        env_payload_b64 = base64.b64encode(deploy_env_path.read_bytes()).decode("ascii")
        env_assignments.append(f"DEPLOY_ENV_PAYLOAD_B64={shlex.quote(env_payload_b64)}")

    ssh_deploy_cmd = (
        f"set -e; cd {shlex.quote(args.vps_repo)}; "
        f"{' '.join(env_assignments)} bash scripts/deploy_vps.sh"
    )

    try:
        if args.dry_run:
            if not args.skip_push:
                print(f"[dry-run] git -C {repo} push {args.remote} {args.branch}")
            print(f"[dry-run] ssh {vps_target} '{ssh_deploy_cmd}'")
            return 0

        if not args.skip_push:
            run(["git", "push", args.remote, args.branch], cwd=repo)

        run(["ssh", vps_target, ssh_deploy_cmd])
    except subprocess.CalledProcessError as exc:
        print(f"[error] Command failed with exit code {exc.returncode}")
        return exc.returncode

    print("[done] Push and VPS deploy completed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
