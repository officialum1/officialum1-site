# DNS-AID records for officialum1.com (Agent Readiness 100%)
# Requires Cloudflare API token with Zone.DNS Edit permission.
#
# Usage:
#   $env:CLOUDFLARE_API_TOKEN = "your_token"
#   $env:CLOUDFLARE_ZONE_ID = "your_zone_id"   # Cloudflare dashboard -> domain -> Overview -> Zone ID
#   .\scripts\setup-cloudflare-dns-aid.ps1

param(
    [string]$ZoneId = $env:CLOUDFLARE_ZONE_ID,
    [string]$ApiToken = $env:CLOUDFLARE_API_TOKEN,
    [string]$Domain = "officialum1.com"
)

if (-not $ZoneId -or -not $ApiToken) {
    Write-Error "Set CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN environment variables."
    exit 1
}

$headers = @{
    Authorization = "Bearer $ApiToken"
    "Content-Type" = "application/json"
}

function Add-DnsRecord {
    param([string]$Name, [string]$Type, [string]$Content, [int]$Ttl = 3600)
    $body = @{
        type = $Type
        name = $Name
        content = $Content
        ttl = $Ttl
        proxied = $false
    } | ConvertTo-Json
    $uri = "https://api.cloudflare.com/client/v4/zones/$ZoneId/dns_records"
    try {
        $r = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
        if ($r.success) { Write-Host "OK $Type $Name" } else { Write-Warning "FAIL $Name : $($r.errors | ConvertTo-Json)" }
    } catch {
        Write-Warning "SKIP $Name (may exist): $($_.Exception.Message)"
    }
}

# SVCB records for DNS-AID discovery (isitagentready.com scanner)
Add-DnsRecord -Name "_index._agents" -Type "SVCB" -Content "1 $Domain. alpn=`"h3,h2`" port=443"
Add-DnsRecord -Name "_mcp._agents" -Type "SVCB" -Content "1 $Domain. alpn=`"h2`" port=443"
Add-DnsRecord -Name "_a2a._agents" -Type "SVCB" -Content "1 $Domain. alpn=`"a2a`" port=443"

# TXT index fallback
Add-DnsRecord -Name "_index._agents" -Type "TXT" -Content '"v=aid1; index=/.well-known/agent-card.json; mcp=/.well-known/mcp/server-card.json"'

Write-Host ""
Write-Host "Done. Enable DNSSEC: Cloudflare Dashboard -> DNS -> DNSSEC -> Enable"
Write-Host "Wait 5-15 min then scan: https://isitagentready.com/officialum1.com"
