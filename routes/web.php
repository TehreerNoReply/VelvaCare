<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'storefront');
Route::view('/shop', 'shop');
Route::view('/about', 'about');
Route::view('/contact', 'contact');
Route::view('/admin', 'admin');
