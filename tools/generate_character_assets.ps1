$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$typeDefinition = @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class CharacterAssetProcessor
{
    public const int TargetWidth = 384;
    public const int TargetHeight = 576;
    public const double WidthScaleRatio = (double)TargetWidth / 1024.0;
    public const double HeightScaleRatio = (double)TargetHeight / 1536.0;

    public static Bitmap RemoveBackground(string sourcePath, int minAverage, int maxDelta)
    {
        Bitmap source = new Bitmap(sourcePath);
        var working = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb);
        using (var graphics = Graphics.FromImage(working))
        {
            graphics.DrawImage(source, new Rectangle(0, 0, source.Width, source.Height));
        }
        source.Dispose();

        var rect = new Rectangle(0, 0, working.Width, working.Height);
        var data = working.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        try
        {
            int stride = data.Stride;
            int bytes = Math.Abs(stride) * working.Height;
            byte[] buffer = new byte[bytes];
            Marshal.Copy(data.Scan0, buffer, 0, bytes);

            bool[] visited = new bool[working.Width * working.Height];
            Queue<int> queue = new Queue<int>();

            for (int x = 0; x < working.Width; x++)
            {
                queue.Enqueue(x);
                queue.Enqueue((working.Height - 1) * working.Width + x);
            }

            for (int y = 0; y < working.Height; y++)
            {
                queue.Enqueue(y * working.Width);
                queue.Enqueue(y * working.Width + (working.Width - 1));
            }

            while (queue.Count > 0)
            {
                int index = queue.Dequeue();
                if (index < 0 || index >= visited.Length || visited[index]) continue;
                visited[index] = true;

                int x = index % working.Width;
                int y = index / working.Width;
                int offset = (y * stride) + (x * 4);
                byte b = buffer[offset];
                byte g = buffer[offset + 1];
                byte r = buffer[offset + 2];
                byte a = buffer[offset + 3];
                if (a == 0 || !IsBackgroundCandidate(r, g, b, minAverage, maxDelta)) continue;

                buffer[offset + 3] = 0;

                if (x > 0) queue.Enqueue(index - 1);
                if (x < working.Width - 1) queue.Enqueue(index + 1);
                if (y > 0) queue.Enqueue(index - working.Width);
                if (y < working.Height - 1) queue.Enqueue(index + working.Width);
            }

            Marshal.Copy(buffer, 0, data.Scan0, bytes);
        }
        finally
        {
            working.UnlockBits(data);
        }

        return working;
    }

    public static Bitmap RecolorHair(Bitmap sourceBitmap, int targetR, int targetG, int targetB)
    {
        var result = new Bitmap(sourceBitmap.Width, sourceBitmap.Height, PixelFormat.Format32bppArgb);
        var sourceRect = new Rectangle(0, 0, sourceBitmap.Width, sourceBitmap.Height);
        var sourceData = sourceBitmap.LockBits(sourceRect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        var resultData = result.LockBits(sourceRect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

        try
        {
            int sourceStride = sourceData.Stride;
            int resultStride = resultData.Stride;
            int sourceBytes = Math.Abs(sourceStride) * sourceBitmap.Height;
            int resultBytes = Math.Abs(resultStride) * result.Height;
            byte[] sourceBuffer = new byte[sourceBytes];
            byte[] resultBuffer = new byte[resultBytes];
            Marshal.Copy(sourceData.Scan0, sourceBuffer, 0, sourceBytes);

            for (int y = 0; y < sourceBitmap.Height; y++)
            {
                for (int x = 0; x < sourceBitmap.Width; x++)
                {
                    int offset = (y * sourceStride) + (x * 4);
                    byte b = sourceBuffer[offset];
                    byte g = sourceBuffer[offset + 1];
                    byte r = sourceBuffer[offset + 2];
                    byte a = sourceBuffer[offset + 3];

                    int resultOffset = (y * resultStride) + (x * 4);
                    if (a == 0)
                    {
                        resultBuffer[resultOffset] = 0;
                        resultBuffer[resultOffset + 1] = 0;
                        resultBuffer[resultOffset + 2] = 0;
                        resultBuffer[resultOffset + 3] = 0;
                        continue;
                    }

                    double luminance = ((r * 0.299) + (g * 0.587) + (b * 0.114)) / 255.0;
                    double factor = Math.Min(1.35, 0.28 + (luminance * 1.12));

                    byte newR = (byte)Math.Min(255, Math.Round(targetR * factor));
                    byte newG = (byte)Math.Min(255, Math.Round(targetG * factor));
                    byte newB = (byte)Math.Min(255, Math.Round(targetB * factor));

                    resultBuffer[resultOffset] = newB;
                    resultBuffer[resultOffset + 1] = newG;
                    resultBuffer[resultOffset + 2] = newR;
                    resultBuffer[resultOffset + 3] = a;
                }
            }

            Marshal.Copy(resultBuffer, 0, resultData.Scan0, resultBytes);
        }
        finally
        {
            sourceBitmap.UnlockBits(sourceData);
            result.UnlockBits(resultData);
        }

        return result;
    }

    public static Bitmap NormalizeHairCanvas(Bitmap sourceBitmap, double scale, int offsetY)
    {
        int targetWidth = TargetWidth;
        int targetHeight = TargetHeight;
        double adjustedScale = scale * WidthScaleRatio;
        int scaledWidth = (int)Math.Round(sourceBitmap.Width * adjustedScale);
        int scaledHeight = (int)Math.Round(sourceBitmap.Height * adjustedScale);
        int scaledOffsetY = (int)Math.Round(offsetY * HeightScaleRatio);
        int offsetX = (targetWidth - scaledWidth) / 2;

        var canvas = new Bitmap(targetWidth, targetHeight, PixelFormat.Format32bppArgb);
        using (var graphics = Graphics.FromImage(canvas))
        {
            graphics.Clear(Color.Transparent);
            graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
            graphics.SmoothingMode = SmoothingMode.HighQuality;
            graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
            graphics.CompositingQuality = CompositingQuality.HighQuality;
            graphics.DrawImage(sourceBitmap, new Rectangle(offsetX, scaledOffsetY, scaledWidth, scaledHeight));
        }
        return canvas;
    }

    public static Bitmap NormalizeBodyCanvas(Bitmap sourceBitmap)
    {
        var canvas = new Bitmap(TargetWidth, TargetHeight, PixelFormat.Format32bppArgb);
        using (var graphics = Graphics.FromImage(canvas))
        {
            graphics.Clear(Color.Transparent);
            graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
            graphics.SmoothingMode = SmoothingMode.HighQuality;
            graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
            graphics.CompositingQuality = CompositingQuality.HighQuality;
            graphics.DrawImage(sourceBitmap, new Rectangle(0, 0, TargetWidth, TargetHeight));
        }
        return canvas;
    }

    public static void SavePng(Bitmap bitmap, string outputPath)
    {
        bitmap.Save(outputPath, ImageFormat.Png);
    }

    private static bool IsBackgroundCandidate(byte r, byte g, byte b, int minAverage, int maxDelta)
    {
        int avg = (r + g + b) / 3;
        int max = Math.Max(r, Math.Max(g, b));
        int min = Math.Min(r, Math.Min(g, b));
        return avg >= minAverage && (max - min) <= maxDelta;
    }
}
"@

Add-Type -TypeDefinition $typeDefinition -ReferencedAssemblies @("System.Drawing")

$root = Split-Path -Parent $PSScriptRoot
$bodySourceDir = Join-Path $root "models"
$hairSourceDir = Join-Path $root "hairstyles"
$bodyOutputDir = Join-Path $root "src\assets\character\body"
$hairOutputDir = Join-Path $root "src\assets\character\hair"

New-Item -ItemType Directory -Force -Path $bodyOutputDir | Out-Null
New-Item -ItemType Directory -Force -Path $hairOutputDir | Out-Null

$skinToneIds = @("ST01", "ST02", "ST03")
$hairColors = @(
  @{ id = "HAIR_BLACK"; rgb = @(27, 23, 23) },
  @{ id = "HAIR_DARK_BROWN"; rgb = @(58, 39, 32) },
  @{ id = "HAIR_MEDIUM_BROWN"; rgb = @(90, 59, 40) },
  @{ id = "HAIR_LIGHT_BROWN"; rgb = @(138, 91, 58) },
  @{ id = "HAIR_DARK_BLONDE"; rgb = @(168, 125, 75) },
  @{ id = "HAIR_GOLDEN_BLONDE"; rgb = @(211, 164, 98) },
  @{ id = "HAIR_SILVER"; rgb = @(199, 198, 213) }
)

$bodySources = @(
  @{ prefix = "infant"; output = "body_infant"; variants = 3 },
  @{ prefix = "toddler"; output = "body_toddler"; variants = 3 },
  @{ prefix = "adult_fem"; output = "body_adult_fem"; variants = 3 },
  @{ prefix = "adult_masc"; output = "body_adult_masc"; variants = 3 }
)

$adultHairSources = @(
  @{ id = "HAIR_AFRO"; file = "afro.png" },
  @{ id = "HAIR_BRAIDS"; file = "braids.png" },
  @{ id = "HAIR_BUZZCUT"; file = "buzzcut.png" },
  @{ id = "HAIR_CESAR"; file = "cesar.png" },
  @{ id = "HAIR_CORNROWS"; file = "cornrows.png" },
  @{ id = "HAIR_CURLYFADE"; file = "curlyfade.png" },
  @{ id = "HAIR_DREADS"; file = "dreads.png" },
  @{ id = "HAIR_EMILY"; file = "emily.png" },
  @{ id = "HAIR_FEM_BLOWOUT"; file = "fem_blowout.png" },
  @{ id = "HAIR_FRONTBANG_MASC"; file = "frontbangmasc.png" },
  @{ id = "HAIR_GUSTAVO"; file = "gustavo.png" },
  @{ id = "HAIR_HAILEY"; file = "hailey.png" },
  @{ id = "HAIR_HIGH_AND_TIGHT"; file = "highandtight.png" },
  @{ id = "HAIR_HIGH_BUN"; file = "highbun.png" },
  @{ id = "HAIR_HIGH_BUN_BRAIDS"; file = "highbunbraids.png" },
  @{ id = "HAIR_LOCS_MASC"; file = "locsmasc.png" },
  @{ id = "HAIR_MEATBALLS"; file = "meatballs.png" },
  @{ id = "HAIR_SLICK_BOB"; file = "slickbob.png" },
  @{ id = "HAIR_SWOOP_MASC"; file = "swoopmasc.png" },
  @{ id = "HAIR_WAVY_FEM"; file = "wavyfem.png" }
)

$toddlerHairSources = @(
  @{ id = "HAIR_TODDLER_SWOOP"; file = "toddler-swoop.png" },
  @{ id = "HAIR_TODDLER_BOB"; file = "toddler_bob.png" },
  @{ id = "HAIR_TODDLER_BOWL"; file = "toddler_bowl.png" },
  @{ id = "HAIR_TODDLER_CORNROWS"; file = "toddler_cornrows.png" },
  @{ id = "HAIR_TODDLER_CURLYFADE"; file = "toddler_curlyfade.png" },
  @{ id = "HAIR_TODDLER_EMILY"; file = "toddler_emily.png" },
  @{ id = "HAIR_TODDLER_GUSTAVO"; file = "toddler_gustavo.png" },
  @{ id = "HAIR_TODDLER_LOCS"; file = "toddler_locs.png" },
  @{ id = "HAIR_TODDLER_LONG"; file = "toddler_long.png" },
  @{ id = "HAIR_TODDLER_PIGTAILS"; file = "toddller_pigtails.png" }
)

foreach ($body in $bodySources) {
  for ($index = 1; $index -le $body.variants; $index++) {
    $sourcePath = Join-Path $bodySourceDir ("{0}_{1}.png" -f $body.prefix, $index)
    $outputPath = Join-Path $bodyOutputDir ("{0}_{1}.png" -f $body.output, $skinToneIds[$index - 1].ToLower())
    $cleanBody = [CharacterAssetProcessor]::RemoveBackground($sourcePath, 214, 20)
    try {
      $normalizedBody = [CharacterAssetProcessor]::NormalizeBodyCanvas($cleanBody)
      try {
        [CharacterAssetProcessor]::SavePng($normalizedBody, $outputPath)
      } finally {
        $normalizedBody.Dispose()
      }
    } finally {
      $cleanBody.Dispose()
    }
  }
}

$hairGroups = @(
  @{ items = $adultHairSources; scale = 0.32; offsetY = -18 },
  @{ items = $toddlerHairSources; scale = 0.31; offsetY = 54 }
)

foreach ($group in $hairGroups) {
  foreach ($hair in $group.items) {
    $sourcePath = Join-Path $hairSourceDir $hair.file
    $cleanHair = [CharacterAssetProcessor]::RemoveBackground($sourcePath, 225, 22)
    try {
      foreach ($colorSpec in $hairColors) {
        $recolored = [CharacterAssetProcessor]::RecolorHair($cleanHair, $colorSpec.rgb[0], $colorSpec.rgb[1], $colorSpec.rgb[2])
        try {
          $normalized = [CharacterAssetProcessor]::NormalizeHairCanvas($recolored, $group.scale, $group.offsetY)
          try {
            $outputPath = Join-Path $hairOutputDir ("{0}_{1}.png" -f $hair.id.ToLower(), $colorSpec.id.ToLower())
            [CharacterAssetProcessor]::SavePng($normalized, $outputPath)
          } finally {
            $normalized.Dispose()
          }
        } finally {
          $recolored.Dispose()
        }
      }
    } finally {
      $cleanHair.Dispose()
    }
  }
}

Write-Host "Character assets generated."
