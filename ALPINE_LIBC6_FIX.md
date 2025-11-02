# Alpine libc6-compat Fix

## Problem

Docker build was failing on Synology with error:
```
ERROR: unable to select packages:
  libc6-compat (no such package):
    required by: world[libc6-compat]
```

## Root Cause

**Alpine Linux 3.19+** removed the `libc6-compat` package and replaced it with `gcompat` from Adélie Linux.

See: https://wiki.alpinelinux.org/wiki/Release_Notes_for_Alpine_3.19.0#GNU_C_Library_Compatibility_Layer

## Solution

Changed `frontend/Dockerfile` from:
```dockerfile
RUN apk add --no-cache libc6-compat
```

To:
```dockerfile
# gcompat replaces libc6-compat in Alpine 3.19+
RUN apk add --no-cache gcompat
```

## Next Steps

1. Commit the Dockerfile fix
2. SSH to Synology and pull changes
3. Run docker-compose build to test the fix
4. Deploy with docker-compose up -d

## Testing on Synology

```bash
# SSH to Synology
ssh -p 2230 mohammad@mohammadasjad.com

# Navigate to project
cd /volume1/PeruFamilyDocs/BitCorp/bitcorp

# Pull latest changes
sudo git pull

# Rebuild with the fix
sudo docker-compose build frontend

# Verify it works
sudo docker-compose up -d
```

## References

- Alpine 3.19 Release Notes: https://wiki.alpinelinux.org/wiki/Release_Notes_for_Alpine_3.19.0
- GitHub Issue: https://github.com/nodejs/docker-node/issues/2040
- Package Info: https://pkgs.alpinelinux.org/package/v3.19/main/x86_64/gcompat
