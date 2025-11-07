# Migration Guide - Old Scripts to New Setup

## Overview

If you were using the old individual setup scripts, here's how to migrate to the new unified setup system.

## What Changed?

### Old Way (Before Cleanup)
```bash
# Multiple separate scripts to run
node createAdmin.js
node createTestAdmin.js
node createTestLibrarian.js
node createTestStudent.js
node createSampleBooks.js
node checkAdmin.js
node findAdmins.js
# ... and more
```

### New Way (After Cleanup)
```bash
# Single command does everything
npm run setup

# Or with all test data
npm run setup:full
```

## Mapping Old Scripts to New Commands

| Old Script | New Command | Notes |
|------------|-------------|-------|
| `createAdmin.js` | `npm run setup` | Creates admin automatically |
| `createTestAdmin.js` | `npm run setup` (choose 'y') | Part of interactive setup |
| `createTestLibrarian.js` | `npm run setup` (choose 'y') | Part of interactive setup |
| `createTestStudent.js` | `npm run setup` (choose 'y') | Part of interactive setup |
| `createTestUsers.js` | `npm run setup` (choose 'y') | Part of interactive setup |
| `createSampleBooks.js` | `npm run setup` (choose 'y') | Part of interactive setup |
| `checkAdmin.js` | `npm run setup` | Shows stats at end |
| `checkUsers.js` | `npm run setup` | Shows stats at end |
| `findAdmins.js` | `npm run setup` | Shows stats at end |
| `findLibrarians.js` | `npm run setup` | Shows stats at end |
| `testAPI.js` | N/A | Use Postman or similar |
| `migrate.js` | N/A | No longer needed |

## Quick Migration Steps

### If You Haven't Set Up Yet

Just use the new setup script:
```bash
cd server
npm run setup
```

### If You Already Have Data

Your existing data is safe! The new setup script:
- ✅ Checks if users already exist
- ✅ Won't create duplicates
- ✅ Shows what's already in the database
- ✅ Only creates missing data

You can safely run:
```bash
npm run setup
```

It will show you what already exists and skip creating duplicates.

## New Features You Get

### 1. Interactive Setup
The new script asks you what you want instead of running everything.

### 2. Better Error Handling
Clear error messages with helpful suggestions.

### 3. Visual Feedback
Beautiful colored console output showing progress.

### 4. Database Statistics
Automatically shows user and book counts at the end.

### 5. Flexible Options
```bash
# Interactive mode
npm run setup

# Automatic full setup (no questions)
npm run setup:full

# Quiet mode (for scripts)
npm run setup -- --quiet
```

## Updated Credentials

The new setup uses slightly different default passwords for better security:

| Account | Old Password | New Password |
|---------|-------------|--------------|
| Admin | admin123456 | Admin@123456 |
| Librarian | librarian123456 | Librarian@123 |
| Student | student123456 | Student@123 |

## What If I Need the Old Scripts?

The old scripts have been removed because they're redundant. If you really need specific functionality:

1. **Check the setup.js file** - All functionality is there
2. **The setup.js is well-documented** - You can modify it if needed
3. **Create custom scripts** - Copy relevant code from setup.js

## Benefits of the New System

### Before (Old Scripts)
- ❌ 12+ separate files to maintain
- ❌ Had to remember which scripts to run
- ❌ Easy to forget steps
- ❌ No consistency checking
- ❌ Poor error handling
- ❌ No progress feedback

### After (New Setup)
- ✅ Single setup script
- ✅ Interactive wizard
- ✅ Checks what exists
- ✅ Prevents duplicates
- ✅ Great error handling
- ✅ Beautiful progress output
- ✅ Statistics at the end

## Troubleshooting

### "I used to run createAdmin.js, where is it?"
Use `npm run setup` - it does the same thing and more.

### "I need to check if admin exists"
Run `npm run setup` - it will tell you if admin already exists and show all user statistics.

### "I want to create test users"
Run `npm run setup` and answer 'y' when asked, or use `npm run setup:full`.

### "I accidentally deleted my admin user"
Run `npm run setup` - it will recreate the admin if it doesn't exist.

### "Can I still use the old scripts?"
The old scripts have been removed, but all functionality is in `setup.js`. You can modify setup.js if you need custom behavior.

## Need Help?

1. **Read the documentation:**
   - `server/README.md` - Backend docs
   - `README.md` - Full project docs
   - `QUICK_START.md` - Quick start guide

2. **Check the setup script:**
   - Open `server/setup.js` to see what it does
   - It's well-commented and easy to understand

3. **Run with verbose output:**
   ```bash
   npm run setup
   ```
   The interactive mode shows everything that's happening.

---

**The new system is better in every way. Give it a try! 🚀**
