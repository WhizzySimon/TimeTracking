param(
    [int]$WaitMinutes = 5
)

$seconds = $WaitMinutes * 60
Write-Host "Waiting $WaitMinutes minutes before checking CI..."
Start-Sleep -Seconds $seconds
Write-Host "Wait complete. Checking CI status..."

# Now run the CI check
& "$PSScriptRoot\check-ci.ps1" -Logs
