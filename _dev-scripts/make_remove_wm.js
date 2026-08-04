// 直接在图片文件上涂掉右下角水印（一劳永逸）
// 用 PowerShell System.Drawing 处理
const { execSync } = require('child_process');
const fs = require('fs');

const imgPath = 'C:/Users/wyb/Desktop/草哥工作台/snow_peaks_v6.png';
const outPath = 'C:/Users/wyb/Desktop/草哥工作台/snow_peaks_v6_clean.png';

// PowerShell 脚本：读取图片，右下角画夜空色渐变色块盖住水印
const ps = `
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('${imgPath.replace(/\//g, '\\')}')
$w = $img.Width
$h = $img.Height
Write-Output "图片尺寸: $($w)x$($h)"
$bmp = New-Object System.Drawing.Bitmap $img
$g = [System.Drawing.Graphics]::FromImage($bmp)

# 水印通常在右下角：盖住右下角 180x50 区域（夜空深蓝色，带柔和渐变）
$rectW = 200
$rectH = 56
$x = $w - $rectW - 8
$y = $h - $rectH - 8

# 用渐变色块（夜空深蓝，模拟周围环境）
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point($x, $y)),
  (New-Object System.Drawing.Point($x, $y + $rectH)),
  [System.Drawing.Color]::FromArgb(255, 16, 26, 52),
  [System.Drawing.Color]::FromArgb(255, 10, 17, 36)
)
$g.FillRectangle($brush, $x, $y, $rectW, $rectH)
$brush.Dispose()
$g.Dispose()

$bmp.Save('${outPath.replace(/\//g, '\\')}', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$img.Dispose()
Write-Output "✅ 水印已涂掉，保存: ${outPath}"
`;

fs.writeFileSync('_dev-scripts/remove_wm.ps1', ps);
console.log('✅ PowerShell 脚本已生成');
