$repoName = 'wedding-invitation'
$gitHubUser = Read-Host "Enter your GitHub username"

Set-Location 'C:\Users\Lenovo\workspace\personal\wedding-invitation'
git init
git branch -M main
git add .
git commit -m "Initial wedding invitation site"
git remote add origin "https://github.com/$gitHubUser/$repoName.git"
git push -u origin main
Write-Host "Repository pushed. Open GitHub Settings > Pages to publish it."
