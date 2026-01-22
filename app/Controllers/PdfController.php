<?php

namespace App\Controllers;

use App\Libraries\PdfToolkit;
use CodeIgniter\HTTP\Files\UploadedFile;
use RuntimeException;

class PdfController extends BaseController
{
    private PdfToolkit $toolkit;

    public function __construct()
    {
        $this->toolkit = new PdfToolkit();
    }

    public function watermark()
    {
        try {
            $pdfFile = $this->request->getFile('pdf');
            if (!$pdfFile instanceof UploadedFile || !$pdfFile->isValid()) {
                return $this->fail('File PDF tidak valid.');
            }

            $inputPath = $this->storeUpload($pdfFile, 'pdf');
            $type = $this->request->getPost('type') ?? 'text';

            if ($type === 'image') {
                $imageFile = $this->request->getFile('logo');
                if (!$imageFile instanceof UploadedFile || !$imageFile->isValid()) {
                    return $this->fail('Logo tidak valid.');
                }
                $imagePath = $this->storeUpload($imageFile, 'logo');
                $options = [
                    'imageWidthRatio' => $this->postFloat('imageWidthRatio', 0.24),
                    'imageOpacity' => $this->postFloat('imageOpacity', 0.3),
                    'imageRotation' => $this->postFloat('imageRotation', -15),
                    'imageAspect' => $this->postFloat('imageAspect', 0.6),
                    'imageScope' => $this->request->getPost('imageScope') ?? 'all',
                    'positionRatioX' => $this->postFloat('positionRatioX', 0.12),
                    'positionRatioY' => $this->postFloat('positionRatioY', 0.12),
                ];
                $outputPath = $this->toolkit->watermarkImage($inputPath, $imagePath, $options);
                $this->cleanupLater([$inputPath, $imagePath, $outputPath]);
                return $this->downloadFile($outputPath, 'watermarked-' . time() . '.pdf');
            }

            $options = [
                'text' => $this->request->getPost('text') ?? '',
                'font' => $this->request->getPost('font') ?? 'Helvetica',
                'fontSizeRatio' => $this->postFloat('fontSizeRatio', 0.08),
                'color' => $this->request->getPost('color') ?? '#6f6f6f',
                'opacity' => $this->postFloat('opacity', 0.2),
                'rotation' => $this->postFloat('rotation', -35),
                'mode' => $this->request->getPost('mode') ?? 'repeat',
                'spacingRatio' => $this->postFloat('spacingRatio', 0.3),
                'patternOffsetRatioX' => $this->postFloat('patternOffsetRatioX', 0.0),
                'patternOffsetRatioY' => $this->postFloat('patternOffsetRatioY', 0.0),
                'positionRatioX' => $this->postFloat('positionRatioX', 0.12),
                'positionRatioY' => $this->postFloat('positionRatioY', 0.12),
            ];
            $outputPath = $this->toolkit->watermarkText($inputPath, $options);
            $this->cleanupLater([$inputPath, $outputPath]);
            return $this->downloadFile($outputPath, 'watermarked-' . time() . '.pdf');
        } catch (\Throwable $error) {
            return $this->fail($error->getMessage());
        }
    }

    public function merge()
    {
        try {
            $files = $this->request->getFiles();
            $uploads = $files['files'] ?? [];
            if (count($uploads) < 2) {
                return $this->fail('Minimal 2 file PDF untuk merge.');
            }
            $paths = [];
            foreach ($uploads as $file) {
                if (!$file instanceof UploadedFile || !$file->isValid()) {
                    return $this->fail('File PDF tidak valid.');
                }
                $paths[] = $this->storeUpload($file, 'merge');
            }
            $outputPath = $this->toolkit->merge($paths);
            $this->cleanupLater(array_merge($paths, [$outputPath]));
            return $this->downloadFile($outputPath, 'merged-' . time() . '.pdf');
        } catch (\Throwable $error) {
            return $this->fail($error->getMessage());
        }
    }

    public function split()
    {
        try {
            $pdfFile = $this->request->getFile('pdf');
            if (!$pdfFile instanceof UploadedFile || !$pdfFile->isValid()) {
                return $this->fail('File PDF tidak valid.');
            }
            $inputPath = $this->storeUpload($pdfFile, 'split');
            $mode = $this->request->getPost('mode') ?? 'all';
            $start = (int) ($this->request->getPost('start') ?? 1);
            $end = (int) ($this->request->getPost('end') ?? $start);
            $outputs = $this->toolkit->split($inputPath, [
                'mode' => $mode,
                'start' => $start,
                'end' => $end,
            ]);

            if ($mode === 'range') {
                $this->cleanupLater([$inputPath, $outputs[0]]);
                return $this->downloadFile($outputs[0], 'split-' . $start . '-' . $end . '.pdf');
            }

            $zipPath = $this->toolkit->zipFiles($outputs, 'split-pages');
            $this->cleanupLater(array_merge([$inputPath, $zipPath], $outputs));
            return $this->downloadFile($zipPath, 'split-pages-' . time() . '.zip');
        } catch (\Throwable $error) {
            return $this->fail($error->getMessage());
        }
    }

    public function compress()
    {
        try {
            $pdfFile = $this->request->getFile('pdf');
            if (!$pdfFile instanceof UploadedFile || !$pdfFile->isValid()) {
                return $this->fail('File PDF tidak valid.');
            }
            $inputPath = $this->storeUpload($pdfFile, 'compress');
            $options = [
                'mode' => $this->request->getPost('mode') ?? 'lossless',
                'quality' => $this->postFloat('quality', 0.75),
                'scale' => $this->postFloat('scale', 1.0),
            ];
            $outputPath = $this->toolkit->compress($inputPath, $options);
            $this->cleanupLater([$inputPath, $outputPath]);
            return $this->downloadFile($outputPath, 'compressed-' . time() . '.pdf');
        } catch (\Throwable $error) {
            return $this->fail($error->getMessage());
        }
    }

    public function toJpg()
    {
        try {
            $pdfFile = $this->request->getFile('pdf');
            if (!$pdfFile instanceof UploadedFile || !$pdfFile->isValid()) {
                return $this->fail('File PDF tidak valid.');
            }
            $inputPath = $this->storeUpload($pdfFile, 'jpg');
            $options = [
                'quality' => $this->postFloat('quality', 0.9),
                'scale' => $this->postFloat('scale', 1.0),
                'scope' => $this->request->getPost('scope') ?? 'all',
                'page' => (int) ($this->request->getPost('page') ?? 1),
            ];

            $outputs = $this->toolkit->toJpg($inputPath, $options);
            if ($options['scope'] === 'current' && count($outputs) === 1) {
                $this->cleanupLater([$inputPath, $outputs[0]]);
                return $this->downloadFile($outputs[0], 'page-' . $options['page'] . '.jpg');
            }

            $zipPath = $this->toolkit->zipFiles($outputs, 'jpg-pages');
            $this->cleanupLater(array_merge([$inputPath, $zipPath], $outputs));
            return $this->downloadFile($zipPath, 'pdf-to-jpg-' . time() . '.zip');
        } catch (\Throwable $error) {
            return $this->fail($error->getMessage());
        }
    }

    private function storeUpload(UploadedFile $file, string $prefix): string
    {
        $targetDir = rtrim(WRITEPATH . 'tmp', DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        $name = $prefix . '-' . $file->getRandomName();
        $file->move($targetDir, $name);
        return $targetDir . $name;
    }

    private function downloadFile(string $path, string $filename)
    {
        return $this->response->download($path, null)->setFileName($filename);
    }

    private function postFloat(string $key, float $default): float
    {
        $value = $this->request->getPost($key);
        if ($value === null || $value === '') {
            return $default;
        }
        return (float) $value;
    }

    private function cleanupLater(array $paths): void
    {
        register_shutdown_function(function () use ($paths): void {
            foreach ($paths as $path) {
                if (is_string($path) && is_file($path)) {
                    @unlink($path);
                }
            }
        });
    }

    private function fail(string $message, int $status = 400)
    {
        return $this->response->setStatusCode($status)->setJSON([
            'error' => $message,
        ]);
    }
}
