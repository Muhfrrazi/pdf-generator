<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->post('api/watermark', 'PdfController::watermark');
$routes->post('api/merge', 'PdfController::merge');
$routes->post('api/split', 'PdfController::split');
$routes->post('api/compress', 'PdfController::compress');
$routes->post('api/pdf-to-jpg', 'PdfController::toJpg');
