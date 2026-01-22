<?php

namespace App\Libraries;

use RuntimeException;
use ZipArchive;
use setasign\Fpdi\Fpdi;

class PdfCanvas extends Fpdi
{
    protected float $angle = 0.0;
    protected array $extgstates = [];

    public function Rotate(float $angle, float $x = -1, float $y = -1): void
    {
        if ($x === -1) {
            $x = $this->x;
        }
        if ($y === -1) {
            $y = $this->y;
        }
        if ($this->angle !== 0.0) {
            $this->_out('Q');
        }
        $this->angle = $angle;
        if ($angle !== 0.0) {
            $rad = deg2rad($angle);
            $c = cos($rad);
            $s = sin($rad);
            $cx = $x * $this->k;
            $cy = ($this->h - $y) * $this->k;
            $this->_out(sprintf('q %.5F %.5F %.5F %.5F %.5F %.5F cm', $c, $s, -$s, $c, $cx, $cy));
        }
    }

    public function SetAlpha(float $alpha, string $bm = 'Normal'): void
    {
        $gs = $this->AddExtGState(['ca' => $alpha, 'CA' => $alpha, 'BM' => '/' . $bm]);
        $this->SetExtGState($gs);
    }

    protected function _endpage(): void
    {
        if ($this->angle !== 0.0) {
            $this->angle = 0.0;
            $this->_out('Q');
        }
        parent::_endpage();
    }

    protected function AddExtGState(array $parms): int
    {
        $n = count($this->extgstates) + 1;
        $this->extgstates[$n] = $parms;
        return $n;
    }

    protected function SetExtGState(int $gs): void
    {
        $this->_out(sprintf('/GS%d gs', $gs));
    }

    protected function _putextgstates(): void
    {
        foreach ($this->extgstates as $i => $parms) {
            $this->_newobj();
            $this->extgstates[$i]['n'] = $this->n;
            $this->_put('<</Type /ExtGState');
            foreach ($parms as $k => $v) {
                $this->_put('/' . $k . ' ' . $v);
            }
            $this->_put('>>');
            $this->_put('endobj');
        }
    }

    protected function _putresourcedict(): void
    {
        parent::_putresourcedict();
        if (!empty($this->extgstates)) {
            $this->_put('/ExtGState <<');
            foreach ($this->extgstates as $i => $parms) {
                $this->_put('/GS' . $i . ' ' . $parms['n'] . ' 0 R');
            }
            $this->_put('>>');
        }
    }

    protected function _putresources(): void
    {
        $this->_putextgstates();
        parent::_putresources();
    }
}

class PdfToolkit
{
    private string $tmpDir;

    public function __construct()
    {
        $this->tmpDir = rtrim(WRITEPATH . 'tmp', DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        if (!is_dir($this->tmpDir)) {
            mkdir($this->tmpDir, 0777, true);
        }
    }

    public function watermarkText(string $inputPath, array $options): string
    {
        $outputPath = $this->tmpPath('watermarked', 'pdf');
        $pdf = new PdfCanvas('P', 'pt');
        $pageCount = $pdf->setSourceFile($inputPath);

        [$fontFamily, $fontStyle] = $this->mapFont($options['font'] ?? 'Helvetica');
        $text = (string) ($options['text'] ?? '');
        $lines = preg_split('/\r?\n/', $text) ?: [];
        $rotation = (float) ($options['rotation'] ?? 0.0);
        $angle = -$rotation;
        $opacity = (float) ($options['opacity'] ?? 0.2);
        $color = $this->hexToRgb($options['color'] ?? '#6f6f6f');
        $mode = $options['mode'] ?? 'repeat';
        $spacingRatio = (float) ($options['spacingRatio'] ?? 0.3);
        $offsetXRatio = (float) ($options['patternOffsetRatioX'] ?? 0.0);
        $offsetYRatio = (float) ($options['patternOffsetRatioY'] ?? 0.0);
        $posXRatio = (float) ($options['positionRatioX'] ?? 0.12);
        $posYRatio = (float) ($options['positionRatioY'] ?? 0.12);
        $fontSizeRatio = (float) ($options['fontSizeRatio'] ?? 0.08);

        for ($pageIndex = 1; $pageIndex <= $pageCount; $pageIndex++) {
            $tpl = $pdf->importPage($pageIndex);
            $size = $pdf->getTemplateSize($tpl);
            $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $pdf->useTemplate($tpl);

            $width = $size['width'];
            $height = $size['height'];
            $fontSize = $fontSizeRatio * $width;
            $lineHeight = $fontSize * 1.2;
            $blockHeight = $lineHeight * max(count($lines), 1);

            $pdf->SetFont($fontFamily, $fontStyle, $fontSize);
            $pdf->SetTextColor($color['r'], $color['g'], $color['b']);
            $pdf->SetAlpha($opacity);

            $blockWidth = 0.0;
            foreach ($lines as $line) {
                $blockWidth = max($blockWidth, $pdf->GetStringWidth($line));
            }

            if ($mode === 'repeat') {
                $spacing = $spacingRatio * $width;
                if ($spacing <= 0) {
                    $spacing = $width * 0.3;
                }
                $offsetX = $offsetXRatio * $width;
                $offsetY = $offsetYRatio * $height;
                $baseX = ($width - $blockWidth) / 2 + $offsetX;
                $baseY = ($height - $blockHeight) / 2 + $offsetY;
                $pivotX = $baseX;
                $pivotY = $baseY + $blockHeight;
                $maxX = $width * 2;
                $maxY = $height * 2;
                $startX = -ceil($maxX / $spacing) * $spacing;
                $startY = -ceil($maxY / $spacing) * $spacing;

                for ($x = $startX; $x <= $maxX; $x += $spacing) {
                    for ($y = $startY; $y <= $maxY; $y += $spacing) {
                        $this->drawTextBlock($pdf, $text, $baseX + $x, $baseY + $y, $pivotX, $pivotY, [
                            'size' => $fontSize,
                            'angle' => $angle,
                            'align' => 'center',
                            'blockWidth' => $blockWidth,
                        ]);
                    }
                }
            } else {
                $topX = $posXRatio * $width;
                $topY = $posYRatio * $height;
                $pivotX = $topX;
                $pivotY = $topY + $blockHeight;
                $this->drawTextBlock($pdf, $text, $topX, $topY, $pivotX, $pivotY, [
                    'size' => $fontSize,
                    'angle' => $angle,
                    'align' => 'center',
                    'blockWidth' => $blockWidth,
                ]);
            }

            $pdf->SetAlpha(1.0);
        }

        $pdf->Output($outputPath, 'F');
        return $outputPath;
    }

    public function watermarkImage(string $inputPath, string $imagePath, array $options): string
    {
        $outputPath = $this->tmpPath('watermarked', 'pdf');
        $pdf = new PdfCanvas('P', 'pt');
        $pageCount = $pdf->setSourceFile($inputPath);

        $imageWidthRatio = (float) ($options['imageWidthRatio'] ?? 0.24);
        $imageOpacity = (float) ($options['imageOpacity'] ?? 0.3);
        $imageRotation = (float) ($options['imageRotation'] ?? -15);
        $imageAspect = (float) ($options['imageAspect'] ?? 0.6);
        $imageScope = $options['imageScope'] ?? 'all';
        $posXRatio = (float) ($options['positionRatioX'] ?? 0.12);
        $posYRatio = (float) ($options['positionRatioY'] ?? 0.12);

        for ($pageIndex = 1; $pageIndex <= $pageCount; $pageIndex++) {
            $tpl = $pdf->importPage($pageIndex);
            $size = $pdf->getTemplateSize($tpl);
            $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $pdf->useTemplate($tpl);

            if ($imageScope === 'first' && $pageIndex > 1) {
                continue;
            }

            $width = $size['width'];
            $height = $size['height'];
            $drawWidth = $imageWidthRatio * $width;
            $drawHeight = $drawWidth * $imageAspect;
            $x = $posXRatio * $width;
            $y = $posYRatio * $height;

            $pdf->SetAlpha($imageOpacity);
            $pdf->Rotate($imageRotation, $x, $y);
            $pdf->Image($imagePath, $x, $y, $drawWidth, $drawHeight);
            $pdf->Rotate(0);
            $pdf->SetAlpha(1.0);
        }

        $pdf->Output($outputPath, 'F');
        return $outputPath;
    }

    public function merge(array $pdfPaths): string
    {
        $outputPath = $this->tmpPath('merged', 'pdf');
        $pdf = new Fpdi();
        foreach ($pdfPaths as $path) {
            $pageCount = $pdf->setSourceFile($path);
            for ($page = 1; $page <= $pageCount; $page++) {
                $tpl = $pdf->importPage($page);
                $size = $pdf->getTemplateSize($tpl);
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($tpl);
            }
        }
        $pdf->Output($outputPath, 'F');
        return $outputPath;
    }

    public function split(string $inputPath, array $options): array
    {
        $pageCount = $this->pageCount($inputPath);
        $mode = $options['mode'] ?? 'all';
        $start = max(1, (int) ($options['start'] ?? 1));
        $end = max($start, (int) ($options['end'] ?? $pageCount));
        $outputs = [];

        if ($mode === 'range') {
            $outputPath = $this->tmpPath('split', 'pdf');
            $this->extractPages($inputPath, $outputPath, range($start, $end));
            return [$outputPath];
        }

        for ($page = 1; $page <= $pageCount; $page++) {
            $outputPath = $this->tmpPath('page-' . $page, 'pdf');
            $this->extractPages($inputPath, $outputPath, [$page]);
            $outputs[] = $outputPath;
        }

        return $outputs;
    }

    public function compress(string $inputPath, array $options): string
    {
        $outputPath = $this->tmpPath('compressed', 'pdf');
        $mode = $options['mode'] ?? 'lossless';

        if ($mode === 'lossless' && $this->binaryExists('qpdf')) {
            $cmd = [
                'qpdf',
                '--stream-data=compress',
                '--object-streams=generate',
                $inputPath,
                $outputPath,
            ];
            $this->runCommand($cmd);
            return $outputPath;
        }

        $gs = $this->requireBinary('gs', 'Ghostscript tidak tersedia untuk kompresi PDF.');
        if ($mode === 'lossless') {
            $cmd = [
                $gs,
                '-sDEVICE=pdfwrite',
                '-dCompatibilityLevel=1.4',
                '-dNOPAUSE',
                '-dBATCH',
                '-dSAFER',
                '-dPDFSETTINGS=/printer',
                '-sOutputFile=' . $outputPath,
                $inputPath,
            ];
            $this->runCommand($cmd);
            return $outputPath;
        }

        $quality = (float) ($options['quality'] ?? 0.75);
        $scale = (float) ($options['scale'] ?? 1.0);
        $dpi = max(36, min(300, (int) round(72 * $scale)));
        $jpegQ = max(10, min(95, (int) round($quality * 100)));

        $cmd = [
            $gs,
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.4',
            '-dNOPAUSE',
            '-dBATCH',
            '-dSAFER',
            '-dDownsampleColorImages=true',
            '-dDownsampleGrayImages=true',
            '-dDownsampleMonoImages=true',
            '-dColorImageDownsampleType=/Bicubic',
            '-dGrayImageDownsampleType=/Bicubic',
            '-dMonoImageDownsampleType=/Bicubic',
            '-dColorImageResolution=' . $dpi,
            '-dGrayImageResolution=' . $dpi,
            '-dMonoImageResolution=' . $dpi,
            '-dJPEGQ=' . $jpegQ,
            '-sOutputFile=' . $outputPath,
            $inputPath,
        ];
        $this->runCommand($cmd);
        return $outputPath;
    }

    public function toJpg(string $inputPath, array $options): array
    {
        $gs = $this->requireBinary('gs', 'Ghostscript tidak tersedia untuk konversi JPG.');
        $quality = (float) ($options['quality'] ?? 0.9);
        $scale = (float) ($options['scale'] ?? 1.0);
        $scope = $options['scope'] ?? 'all';
        $page = (int) ($options['page'] ?? 1);
        $dpi = max(36, min(300, (int) round(72 * $scale)));
        $jpegQ = max(10, min(95, (int) round($quality * 100)));
        $prefix = 'jpg-' . bin2hex(random_bytes(4));
        $pattern = $this->tmpDir . $prefix . '-%03d.jpg';

        $cmd = [
            $gs,
            '-sDEVICE=jpeg',
            '-dNOPAUSE',
            '-dBATCH',
            '-dSAFER',
            '-r' . $dpi,
            '-dJPEGQ=' . $jpegQ,
        ];

        if ($scope === 'current') {
            $cmd[] = '-dFirstPage=' . $page;
            $cmd[] = '-dLastPage=' . $page;
        }

        $cmd[] = '-sOutputFile=' . $pattern;
        $cmd[] = $inputPath;

        $this->runCommand($cmd);

        $files = glob($this->tmpDir . $prefix . '-*.jpg') ?: [];
        sort($files);
        if ($scope === 'current') {
            return array_slice($files, 0, 1);
        }
        return $files;
    }

    public function zipFiles(array $paths, string $prefix): string
    {
        $zipPath = $this->tmpPath($prefix, 'zip');
        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Gagal membuat ZIP.');
        }
        foreach ($paths as $path) {
            $zip->addFile($path, basename($path));
        }
        $zip->close();
        return $zipPath;
    }

    private function pageCount(string $inputPath): int
    {
        $pdf = new Fpdi();
        return $pdf->setSourceFile($inputPath);
    }

    private function extractPages(string $inputPath, string $outputPath, array $pages): void
    {
        $pdf = new Fpdi();
        $pdf->setSourceFile($inputPath);
        foreach ($pages as $page) {
            $tpl = $pdf->importPage($page);
            $size = $pdf->getTemplateSize($tpl);
            $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $pdf->useTemplate($tpl);
        }
        $pdf->Output($outputPath, 'F');
    }

    private function drawTextBlock(PdfCanvas $pdf, string $text, float $topX, float $topY, float $pivotX, float $pivotY, array $options): void
    {
        $lines = preg_split('/\r?\n/', $text) ?: [''];
        $lineHeight = ($options['size'] ?? 12) * 1.2;
        $angle = (float) ($options['angle'] ?? 0.0);
        $rad = deg2rad($angle);
        $cos = cos($rad);
        $sin = sin($rad);
        $blockWidth = (float) ($options['blockWidth'] ?? 0.0);

        foreach ($lines as $index => $line) {
            $lineWidth = $pdf->GetStringWidth($line);
            $alignOffset = ($options['align'] ?? 'center') === 'center'
                ? ($blockWidth - $lineWidth) / 2
                : 0;
            $baseX = $topX + $alignOffset;
            $baseY = $topY + $lineHeight * ($index + 1);
            $dx = $baseX - $pivotX;
            $dy = $baseY - $pivotY;
            $drawX = $pivotX + $dx * $cos - $dy * $sin;
            $drawY = $pivotY + $dx * $sin + $dy * $cos;
            $pdf->Rotate($angle, $drawX, $drawY);
            $pdf->Text($drawX, $drawY, $line);
            $pdf->Rotate(0);
        }
    }

    private function hexToRgb(string $hex): array
    {
        $clean = ltrim($hex, '#');
        if (strlen($clean) === 3) {
            $clean = $clean[0] . $clean[0] . $clean[1] . $clean[1] . $clean[2] . $clean[2];
        }
        $int = hexdec($clean);
        return [
            'r' => ($int >> 16) & 255,
            'g' => ($int >> 8) & 255,
            'b' => $int & 255,
        ];
    }

    private function mapFont(string $fontKey): array
    {
        $map = [
            'Helvetica' => ['Helvetica', ''],
            'HelveticaBold' => ['Helvetica', 'B'],
            'TimesRoman' => ['Times', ''],
            'TimesBold' => ['Times', 'B'],
            'Courier' => ['Courier', ''],
            'CourierBold' => ['Courier', 'B'],
        ];
        return $map[$fontKey] ?? ['Helvetica', ''];
    }

    private function tmpPath(string $prefix, string $ext): string
    {
        $name = $prefix . '-' . bin2hex(random_bytes(6));
        return $this->tmpDir . $name . '.' . $ext;
    }

    private function binaryExists(string $binary): bool
    {
        if (!function_exists('exec')) {
            return false;
        }
        $output = [];
        $code = 1;
        @\exec('command -v ' . escapeshellarg($binary), $output, $code);
        return $code === 0 && !empty($output);
    }

    private function requireBinary(string $binary, string $message): string
    {
        if (!$this->binaryExists($binary)) {
            throw new RuntimeException($message);
        }
        return $binary;
    }

    private function runCommand(array $cmd): void
    {
        if (!function_exists('exec')) {
            throw new RuntimeException('Fitur ini tidak tersedia di hosting saat ini.');
        }
        $command = implode(' ', array_map('escapeshellarg', $cmd));
        $output = [];
        $code = 0;
        @\exec($command . ' 2>&1', $output, $code);
        if ($code !== 0) {
            $detail = trim(implode("\n", $output));
            throw new RuntimeException('Perintah gagal dijalankan. ' . $detail);
        }
    }
}
