# backup-db.ps1
# Secure PostgreSQL Backup Script for Windows environments

$ErrorActionPreference = "Stop"

# Define backup directory inside the project workspace
$BackupDir = Join-Path $PSScriptRoot "../../backups"
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Created backup directory: $BackupDir"
}

# Apply secure ACLs on Backup Directory (only administrators and owner have access)
$Acl = Get-Acl $BackupDir
$Acl.SetAccessRuleProtection($true, $false) # Remove inheritance
# Owner full control
$Ar = New-Object System.Security.AccessControl.FileSystemAccessRule("Administrators", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$Acl.AddAccessRule($Ar)
Set-Acl $BackupDir $Acl
Write-Host "Applied secure access permissions to backup directory."

# Find .env path
$EnvPath = Join-Path $PSScriptRoot "../.env"
if (!(Test-Path $EnvPath)) {
    $EnvPath = Join-Path $PSScriptRoot "../../.env"
}

if (!(Test-Path $EnvPath)) {
    Write-Error "Could not find .env configuration file!"
    exit 1
}

# Parse .env for DATABASE_URL
$DbUrl = ""
Get-Content $EnvPath | ForEach-Object {
    if ($_ -match "^DATABASE_URL=`"?(postgresql://[^`"\s]+)`"?") {
        $DbUrl = $Matches[1]
    }
}

if ([string]::IsNullOrEmpty($DbUrl)) {
    Write-Error "DATABASE_URL not found or invalid in .env!"
    exit 1
}

# Parse PostgreSQL connection details from DATABASE_URL
# Format: postgresql://username:password@host:port/database?schema=public
if ($DbUrl -match "postgresql://([^:]+):([^@]+)@([^:/]+):?(\d*)/([^?]+)") {
    $User = $Matches[1]
    $Pass = $Matches[2]
    $Host = $Matches[3]
    $Port = $Matches[4]
    $DbName = $Matches[5]
} else {
    Write-Error "Could not parse DATABASE_URL connection details!"
    exit 1
}

if ([string]::IsNullOrEmpty($Port)) {
    $Port = "5432"
}

# Set PostgreSQL password environment variable for pg_dump
$env:PGPASSWORD = $Pass

# Set filename with timestamp
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "apc_db_backup_$Timestamp.sql"

Write-Host "Starting database backup for $DbName on $Host:$Port..."

# Call pg_dump utility
& pg_dump -h $Host -p $Port -U $User -d $DbName -f $BackupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup completed successfully! Saved to $BackupFile"
} else {
    Write-Error "pg_dump failed with exit code $LASTEXITCODE"
    exit 1
}

# Clear PGPASSWORD
$env:PGPASSWORD = $null

# Retention: delete backups older than 7 days
$RetentionDays = 7
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)

Write-Host "Cleaning up old backups (older than $RetentionDays days)..."
Get-ChildItem $BackupDir -Filter "apc_db_backup_*.sql" | ForEach-Object {
    if ($_.CreationTime -lt $CutoffDate) {
        Remove-Item $_.FullName -Force
        Write-Host "Deleted expired backup: $($_.Name)"
    }
}

Write-Host "Backup maintenance process completed."
