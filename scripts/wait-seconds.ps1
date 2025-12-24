param(
    [Parameter(Mandatory=$true)]
    [int]$Seconds
)

Write-Host "Waiting $Seconds seconds..."
Start-Sleep -Seconds $Seconds
Write-Host "Wait complete."
