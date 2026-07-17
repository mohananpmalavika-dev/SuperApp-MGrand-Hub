# SuperApp MGrand Hub - Auth Service Test

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Testing Auth Service" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api/auth"

# Test 1: Register
Write-Host "Test 1: Register User" -ForegroundColor Yellow
$registerBody = @{
    email = "test@mgrandhub.com"
    password = "Test123456"
    name = "Test User"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($response.data.user._id)" -ForegroundColor White
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠ User already exists (this is OK)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 2: Login
Write-Host "Test 2: Login User" -ForegroundColor Yellow
$loginBody = @{
    email = "test@mgrandhub.com"
    password = "Test123456"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Login successful!" -ForegroundColor Green
    $token = $response.data.accessToken
    Write-Host "Access Token: $($token.Substring(0, 20))..." -ForegroundColor White
    
    Write-Host ""
    
    # Test 3: Get Profile
    Write-Host "Test 3: Get Profile" -ForegroundColor Yellow
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $profile = Invoke-RestMethod -Uri "$baseUrl/profile" -Method Get -Headers $headers
    Write-Host "✓ Profile retrieved!" -ForegroundColor Green
    Write-Host "Name: $($profile.data.user.name)" -ForegroundColor White
    Write-Host "Email: $($profile.data.user.email)" -ForegroundColor White
    Write-Host "Role: $($profile.data.user.role)" -ForegroundColor White
    
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Auth Service Tests Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
