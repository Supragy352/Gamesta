# Gamesta Scripts Directory

This directory contains all utility scripts organized by category.

## 📁 Directory Structure

### `/database/`
SQL scripts and database-related utilities:
- `complete-gamesta-schema.sql` - Complete database schema
- `clean-missing-tables-schema.sql` - Clean schema for missing tables
- `missing-tables-schema.sql` - Schema for missing tables
- `check-db-status.js` - Database status checker
- `check-user-data.sql` - User data verification
- `fix-user-rls-policies.sql` - RLS policies fix
- `database-schema.md` - Database schema documentation

### `/testing/`
Test scripts for various functionality:
- `test-improved-login-flow.js` - Login flow testing
- `test-logging-security.js` - Security logging tests
- `test-logging.js` - General logging tests
- `test-login-debug.js` - Login debugging tests
- `test-rls-fix.js` - RLS fix testing
- `test-signup-fix.js` - Signup fix testing

### `/utilities/`
General utility and debugging scripts:
- `debug-login-flow.js` - Login flow debugging
- `debug-login-issues.js` - Login issue debugging
- `fix-user-account.js` - User account fixes
- `inspect-database.js` - Database inspection tool
- `copilot-command-runner.ps1` - PowerShell copilot commands
- `gamesta-shortcuts.ps1` - Gamesta utility shortcuts

## 🚀 How to Use

1. **Database Scripts**: Run SQL files in your Supabase SQL Editor
2. **Testing Scripts**: Run with Node.js in development environment
3. **Utility Scripts**: Use for debugging and maintenance tasks

## 📝 Notes

- Always backup your database before running SQL scripts
- Test scripts are designed for development environment
- PowerShell scripts are Windows-specific utilities
