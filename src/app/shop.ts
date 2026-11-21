import { Component, signal, computed, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order } from './orders';
import { CartItem } from './cart';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviewsCount: number;
  colors: string[];
  sizes: string[];
  description: string;
}

interface Selection {
  color: string;
  size: string;
  quantity: number;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shop-container">
      <header class="header">
        <div class="top-nav">
          <div class="logo-container">
            <h1 class="daily-fit">DAILY FIT</h1>
            <span class="shop-text">shop</span>
          </div>
          <div class="nav-actions">
            <button class="cart-nav-btn" (click)="viewCart.emit()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span class="badge" *ngIf="cartCount > 0">{{cartCount}}</span>
            </button>
            <button class="orders-nav-btn" (click)="viewOrders.emit()">
              MY ORDERS
            </button>
          </div>
        </div>
        
        <div class="search-section">
          <div class="search-bar">
            <input 
              type="text" 
              placeholder="/Search bar" 
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
            />
            <button class="search-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
        </div>

        <div class="filter-tabs">
          <button 
            *ngFor="let cat of categories" 
            [class.active]="activeCategory() === cat"
            (click)="activeCategory.set(cat)"
          >
            {{cat}}
          </button>
        </div>
      </header>

      <main class="product-grid">
        <div class="product-card" *ngFor="let p of processedProducts(); trackBy: trackById">
          <div class="product-image-area" (click)="zoomedImage.set(p.image)">
            <img [src]="p.image" [alt]="p.name" loading="lazy" />
          </div>
          
          <div class="product-info-middle">
            <div class="label-rating-row">
              <h3 class="product-label-below">{{p.name}}</h3>
              <div class="rating-badge-below">★ {{p.rating}}</div>
            </div>
          </div>
          
          <div class="product-footer">
            <div class="price-action">
              <span class="price">₱{{p.price}}</span>
              <button class="buy-btn" (click)="$event.stopPropagation(); openSelectionModal(p, 'buy')">BUY</button>
            </div>
            <div class="cart-icon-container" (click)="$event.stopPropagation(); openSelectionModal(p, 'cart')">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </div>
          </div>
        </div>
      </main>

      <footer class="shop-footer">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="footer-logo">
              <span class="footer-daily">DAILY FIT</span>
              <span class="footer-shop">shop</span>
            </div>
            <p class="footer-tagline">Train hard, look sharp. Premium fitness tees built for the grind.</p>
          </div>

          <div class="footer-links">
            <h4>Shop</h4>
            <a (click)="activeCategory.set('all')">All Products</a>
            <a (click)="activeCategory.set('oversized')">Oversized</a>
            <a (click)="activeCategory.set('slim-fit')">Slim Fit</a>
            <a (click)="activeCategory.set('graphic')">Graphic</a>
          </div>

          <div class="footer-links">
            <h4>Support</h4>
            <a (click)="viewOrders.emit()">My Orders</a>
            <a (click)="viewCart.emit()">My Cart</a>
            <a>Shipping Info</a>
            <a>Returns</a>
          </div>

          <div class="footer-contact">
            <h4>Get in Touch</h4>
            <p><span class="contact-label">Address:</span> Manila, Philippines</p>
            <p><span class="contact-label">Phone:</span> 0912 345 6789</p>
            <p><span class="contact-label">Email:</span> hello&#64;dailyfit.shop</p>
            <div class="footer-socials">
              <button class="social-btn" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>
              </button>
              <button class="social-btn" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
              </button>
              <button class="social-btn" aria-label="X">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© 2026 Daily Fit Shop. All rights reserved.</span>
          <span class="footer-made">Built for the grind.</span>
        </div>
      </footer>

      <!-- Zoom Modal -->
      <div class="modal-overlay zoom-overlay" *ngIf="zoomedImage()" (click)="zoomedImage.set(null)">
        <div class="zoom-content" (click)="$event.stopPropagation()">
          <img [src]="zoomedImage()" alt="Zoomed Product">
          <button class="close-zoom" (click)="zoomedImage.set(null)">✕</button>
        </div>
      </div>

      <!-- Selection Modal -->
      <div class="modal-overlay" *ngIf="activeSelectionProduct()">
        <div class="modal-content selection-modal">
          <h3>{{activeSelectionProduct()?.name}}</h3>
          <p class="product-description">{{activeSelectionProduct()?.description}}</p>
          <div class="options-container">
            <div class="option-row">
              <span class="option-label">Color:</span>
              <div class="color-picker">
                <button 
                  *ngFor="let color of activeSelectionProduct()?.colors" 
                  [style.background-color]="color"
                  [class.active]="selections[activeSelectionProduct()!.id].color === color"
                  (click)="updateSelection(activeSelectionProduct()!.id, 'color', color)"
                  class="color-btn"
                ></button>
              </div>
            </div>

            <div class="option-row">
              <span class="option-label">Size:</span>
              <div class="size-picker">
                <button 
                  *ngFor="let size of activeSelectionProduct()?.sizes" 
                  [class.active]="selections[activeSelectionProduct()!.id].size === size"
                  (click)="updateSelection(activeSelectionProduct()!.id, 'size', size)"
                  class="size-btn"
                >{{size}}</button>
              </div>
            </div>

            <div class="option-row">
              <span class="option-label">Quantity:</span>
              <div class="qty-picker">
                <button (click)="updateQty(activeSelectionProduct()!.id, -1)">-</button>
                <input type="number" [ngModel]="selections[activeSelectionProduct()!.id].quantity" readonly />
                <button (click)="updateQty(activeSelectionProduct()!.id, 1)">+</button>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="next-btn" (click)="onSelectionNext()">
              {{ selectionMode() === 'buy' ? 'NEXT' : 'ADD TO CART' }}
            </button>
            <button class="close-btn" (click)="activeSelectionProduct.set(null)">CANCEL</button>
          </div>
        </div>
      </div>

      <!-- Checkout Modal -->
      <div class="modal-overlay" *ngIf="isCheckoutMode()">
        <div class="modal-content checkout-modal">
          <h3>Customer Information</h3>
          <div class="form-container">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="customerInfo.name" placeholder="Enter your full name" />
            </div>
            <div class="form-group">
              <label>Delivery Address</label>
              <textarea [(ngModel)]="customerInfo.address" placeholder="Enter complete address"></textarea>
            </div>
            <div class="form-group">
              <label>Contact Number (11 digits)</label>
              <input 
                type="text" 
                [(ngModel)]="customerInfo.contact" 
                (ngModelChange)="validateContact($event)"
                placeholder="09XXXXXXXXX" 
                maxlength="11"
              />
              <small class="error-text" *ngIf="customerInfo.contact.length > 0 && customerInfo.contact.length < 11">
                Must be exactly 11 digits
              </small>
            </div>
          </div>
          <div class="modal-actions">
            <button 
              class="confirm-btn" 
              [disabled]="!isFormValid()"
              (click)="confirmOrder()"
            >
              {{ isAddingToCart() ? 'PLACING ORDER...' : 'CONFIRM ORDER' }}
            </button>
            <button class="close-btn" (click)="isCheckoutMode.set(false)">BACK</button>
          </div>
        </div>
      </div>

      <div class="notification" [class.show]="showNotification()">
        {{notificationText()}}
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Permanent+Marker&family=Inter:wght@400;700&display=swap');

    .shop-container {
      min-height: 100vh;
      background: linear-gradient(to right, #000000 0%, #1a1a1a 50%, #434343 100%);
      color: white;
      padding: 40px 20px;
      font-family: 'Inter', sans-serif;
    }

    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
      margin-bottom: 50px;
      max-width: 1000px;
      margin-inline: auto;
    }

    .top-nav {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .nav-actions {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .cart-nav-btn {
      background: #1a1a1a;
      border: 2px solid #333;
      color: #fff;
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }

    .cart-nav-btn:hover {
      background: #252525;
      border-color: #ff3333;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(255, 51, 51, 0.2);
    }

    .cart-nav-btn svg {
      width: 24px;
      height: 24px;
      stroke: #fff;
    }

    .cart-nav-btn .badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ff3333;
      color: white;
      font-size: 10px;
      font-weight: bold;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #000;
    }

    .logo-container {
      position: relative;
      transform: rotate(-15deg);
      margin-left: 20px;
    }

    .daily-fit {
      font-family: 'Bangers', cursive;
      font-size: 80px;
      color: #fff;
      margin: 0;
      line-height: 1;
      text-shadow: 4px 4px 0px #333;
      -webkit-text-stroke: 1px #fff;
    }

    .shop-text {
      font-family: 'Permanent Marker', cursive;
      font-size: 40px;
      color: #ff4d4d;
      position: absolute;
      bottom: -20px;
      right: -20px;
      transform: rotate(10deg);
    }

    .orders-nav-btn {
      background: #0047ab;
      color: white;
      border: 1px solid #333;
      padding: 10px 25px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .orders-nav-btn:hover {
      background: #0056d2;
      box-shadow: 0 0 15px rgba(0, 71, 171, 0.3);
    }

    .search-section {
      width: 100%;
      max-width: 400px;
    }

    .search-bar {
      display: flex;
      align-items: center;
      background: #2a2a2a;
      border: 2px solid #000;
      border-radius: 8px;
      overflow: hidden;
    }

    .search-bar input {
      flex: 1;
      background: transparent;
      border: none;
      color: #eee;
      padding: 10px 15px;
      font-size: 16px;
      outline: none;
    }

    .search-btn {
      background: linear-gradient(to bottom, #d4af37, #8a6d3b);
      border: none;
      padding: 10px 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .search-btn:hover { opacity: 0.9; }

    .filter-tabs {
      display: flex;
      gap: 15px;
      margin-top: 10px;
    }

    .filter-tabs button {
      background: transparent;
      border: none;
      color: #666;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding-bottom: 5px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .filter-tabs button.active {
      color: #ff3333;
      border-bottom-color: #ff3333;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .product-card {
      background: #111;
      border: 1px solid #222;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .product-card:hover {
      transform: translateY(-8px);
      border-color: #444;
      box-shadow: 0 15px 35px rgba(0,0,0,0.6);
    }

    .product-card:hover .product-image-area img {
      transform: scale(1.1);
      opacity: 1;
    }

    .product-image-area {
      background: #000;
      aspect-ratio: 4/3;
      border-bottom: 1px solid #222;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      cursor: zoom-in;
    }

    .product-image-area img {
      width: 100%;
      height: 105%;
      object-fit: cover;
      object-position: top;
      opacity: 0.8;
      transition: transform 0.5s;
    }

    .product-info-middle {
      padding: 0 5px;
    }

    .label-rating-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .product-label-below {
      color: white;
      font-size: 18px;
      font-weight: 500;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .rating-badge-below {
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: #d4af37;
      font-weight: bold;
      border: 1px solid #333;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price-action {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .price {
      font-size: 20px;
      font-weight: bold;
    }

    .buy-btn {
      background: #ff3333;
      color: white;
      border: none;
      padding: 5px 20px;
      border-radius: 15px;
      font-weight: bold;
      cursor: pointer;
    }

    .buy-btn:hover { background: #ff4d4d; }

    .cart-icon-container {
      background: #1a1a1a;
      border: 1px solid #333;
      padding: 10px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cart-icon-container:hover {
      background: #252525;
      border-color: #ff3333;
      transform: scale(1.1);
    }

    .cart-icon-container svg {
      width: 20px;
      height: 20px;
      stroke: #fff;
    }

    .newsletter {
      max-width: 800px;
      margin: 60px auto 20px;
      background: #111;
      padding: 40px;
      border: 2px solid #222;
      text-align: center;
      border-radius: 8px;
    }

    .newsletter h3 {
      font-family: 'Bangers', cursive;
      font-size: 32px;
      margin: 0 0 10px;
      letter-spacing: 2px;
    }

    .newsletter p {
      color: #888;
      margin-bottom: 25px;
    }

    .subscribe-form {
      display: flex;
      max-width: 500px;
      margin: 0 auto;
      gap: 10px;
    }

    .subscribe-form input {
      flex: 1;
      background: #222;
      border: 1px solid #333;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      outline: none;
    }

    .subscribe-form button {
      background: white;
      color: black;
      border: none;
      padding: 0 25px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }

    .subscribe-form button:hover { background: #eee; }

    .zoom-overlay {
      cursor: pointer;
    }

    .zoom-content {
      position: relative;
      max-width: 90%;
      max-height: 90%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: zoomIn 0.3s ease;
    }

    @keyframes zoomIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .zoom-content img {
      max-width: 100%;
      max-height: 80vh;
      border: 3px solid #ff3333;
      border-radius: 8px;
      box-shadow: 0 0 50px rgba(0,0,0,0.8);
    }

    .close-zoom {
      position: absolute;
      top: -20px;
      right: -20px;
      background: #ff3333;
      color: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      z-index: 1001;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    .close-zoom:hover { background: #ff4d4d; transform: scale(1.1); }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(5px);
    }

    .modal-content {
      background: #1a1a1a;
      border: 2px solid #ff3333;
      padding: 30px;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
    }

    .modal-content h3 {
      font-family: 'Bangers', cursive;
      font-size: 28px;
      margin-top: 0;
      margin-bottom: 20px;
      color: #ff3333;
      letter-spacing: 1px;
    }

    .product-description {
      font-size: 14px;
      color: #aaa;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .options-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 25px;
    }

    .option-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .option-label { font-size: 14px; color: #888; font-weight: bold; }

    .color-picker, .size-picker { display: flex; gap: 10px; }

    .color-btn {
      width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent;
      cursor: pointer; transition: transform 0.2s;
    }

    .color-btn.active { border-color: white; transform: scale(1.2); }

    .size-btn {
      background: #222; border: 1px solid #444; color: #888; padding: 5px 12px;
      border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;
    }

    .size-btn.active { background: white; color: black; border-color: white; }

    .qty-picker {
      display: flex; align-items: center; background: #222; border-radius: 4px;
      overflow: hidden; border: 1px solid #444;
    }

    .qty-picker button {
      background: #333; border: none; color: white; padding: 5px 15px;
      cursor: pointer; font-weight: bold;
    }

    .qty-picker input {
      width: 40px; background: transparent; border: none; color: white;
      text-align: center; font-weight: bold;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 25px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .form-group label { font-size: 12px; color: #888; font-weight: bold; }

    .form-group input, .form-group textarea {
      background: #222; border: 1px solid #333; color: white; padding: 10px;
      border-radius: 6px; font-family: inherit;
    }

    .form-group textarea { height: 80px; resize: none; }

    .error-text { color: #ff3333; font-size: 10px; margin-top: 2px; }

    .modal-actions { display: flex; gap: 10px; }

    .next-btn, .confirm-btn {
      flex: 1; background: #ff3333; color: white; border: none; padding: 10px;
      border-radius: 6px; font-weight: bold; cursor: pointer;
    }

    .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .close-btn {
      flex: 1; background: #333; color: #888; border: none; padding: 10px;
      border-radius: 6px; font-weight: bold; cursor: pointer;
    }

    .notification {
      position: fixed; bottom: 20px; right: 20px; background: #28a745;
      color: white; padding: 15px 30px; border-radius: 8px;
      transform: translateY(100px); transition: transform 0.3s;
      z-index: 2000; font-weight: bold; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .notification.show { transform: translateY(0); }

    /* Footer */
    .shop-footer {
      max-width: 800px;
      margin: 70px auto 0;
      padding-top: 40px;
      border-top: 2px solid #222;
    }

    .footer-content {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1.3fr;
      gap: 30px;
    }

    .footer-logo {
      display: inline-block;
      transform: rotate(-4deg);
      margin-bottom: 15px;
    }

    .footer-daily {
      font-family: 'Bangers', cursive;
      font-size: 34px;
      color: #fff;
      letter-spacing: 1px;
      text-shadow: 3px 3px 0 #333;
    }

    .footer-shop {
      font-family: 'Permanent Marker', cursive;
      font-size: 20px;
      color: #ff4d4d;
      margin-left: 6px;
    }

    .footer-tagline {
      color: #888;
      font-size: 13px;
      line-height: 1.6;
      margin: 0;
    }

    .footer-links h4,
    .footer-contact h4 {
      color: #fff;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 15px;
    }

    .footer-links a {
      display: block;
      color: #888;
      font-size: 13px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: color 0.2s;
    }

    .footer-links a:hover { color: #ff3333; }

    .footer-contact p {
      color: #888;
      font-size: 13px;
      margin: 0 0 10px;
    }

    .contact-label { color: #d4af37; font-weight: bold; }

    .footer-socials {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .social-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #1a1a1a;
      border: 1px solid #333;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .social-btn:hover {
      background: #ff3333;
      border-color: #ff3333;
      transform: translateY(-2px);
    }

    .social-btn svg { width: 18px; height: 18px; }

    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #222;
      color: #666;
      font-size: 12px;
    }

    .footer-made {
      color: #ff3333;
      font-family: 'Permanent Marker', cursive;
    }

    @media (max-width: 600px) {
      .product-grid { grid-template-columns: 1fr; }
      .daily-fit { font-size: 50px; }
      .shop-text { font-size: 25px; }
      .footer-content { grid-template-columns: 1fr 1fr; gap: 25px; }
      .footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
    }
  `]
})
export class Shop {
  @Input() cartCount: number = 0;
  @Output() viewOrders = new EventEmitter<void>();
  @Output() viewCart = new EventEmitter<void>();
  @Output() addOrder = new EventEmitter<Order>();
  @Output() addToCart = new EventEmitter<CartItem>();

  searchQuery = signal('');
  activeCategory = signal('all');
  sortBy = signal('featured');
  activeSelectionProduct = signal<Product | null>(null);
  selectionMode = signal<'buy' | 'cart'>('buy');
  zoomedImage = signal<string | null>(null);
  isCheckoutMode = signal(false);
  isAddingToCart = signal(false);
  showNotification = signal(false);
  notificationText = signal('Order Placed Successfully!');

  customerInfo = {
    name: '',
    address: '',
    contact: ''
  };

  categories = ['all', 'oversized', 'slim-fit', 'graphic'];

  allProducts: Product[] = [
    { 
      id: 2, name: 'FIT OVERSIZED', price: 350, category: 'oversized', rating: 4.9, reviewsCount: 210,
      colors: ['#333', 'navy', 'maroon'], sizes: ['M', 'L', 'XL', '2XL'],
      description: 'Loose-fit heavyweight cotton shirt that offers a modern streetwear look without sacrificing comfort.',
      image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Oversized%20Tshirt%20Streetwear&image_size=landscape_4_3' 
    },
    { 
      id: 3, name: 'GYM GRAPHIC', price: 280, category: 'graphic', rating: 4.7, reviewsCount: 85,
      colors: ['black', 'white'], sizes: ['S', 'M', 'L', 'XL'],
      description: 'Breathable performance fabric featuring a bold fitness-inspired graphic for your gym sessions.',
      image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Gym%20Graphic%20Tshirt&image_size=landscape_4_3' 
    },
    { 
      id: 4, name: 'ELITE PERFORMANCE', price: 320, category: 'slim-fit', rating: 4.5, reviewsCount: 64,
      colors: ['blue', 'red', 'black'], sizes: ['S', 'M', 'L'],
      description: 'Technical moisture-wicking fabric that keeps you cool and dry even during the most intense workouts.',
      image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Performance%20Sport%20Tshirt&image_size=landscape_4_3' 
    },
    { 
      id: 5, name: 'VINTAGE WASH', price: 270, category: 'oversized', rating: 4.6, reviewsCount: 42,
      colors: ['gray', 'navy'], sizes: ['M', 'L', 'XL'],
      description: 'Vintage-inspired washed cotton tee for that lived-in feel and classic aesthetic.',
      image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Vintage%20Washed%20Tshirt&image_size=landscape_4_3' 
    },
    { 
      id: 6, name: 'URBAN STREET', price: 300, category: 'graphic', rating: 4.4, reviewsCount: 38,
      colors: ['black', 'white'], sizes: ['S', 'M', 'L', 'XL'],
      description: 'Modern urban design with high-quality screen printing on premium cotton.',
      image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Urban%20Streetwear%20Tshirt&image_size=landscape_4_3' 
    },
    { 
      id: 7, name: 'CORE BASICS', price: 250, category: 'slim-fit', rating: 4.3, reviewsCount: 92,
      colors: ['white', 'black', 'navy'], sizes: ['S', 'M', 'L', 'XL'],
      description: 'The essential base layer for any outfit, featuring a tailored fit and soft feel.',
      image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Basic%20White%20Tshirt&image_size=landscape_4_3' 
    },
    { 
      id: 8, name: 'POWER GRAPHIC', price: 310, category: 'graphic', rating: 4.7, reviewsCount: 55,
      colors: ['black', 'red'], sizes: ['M', 'L', 'XL', '2XL'],
      description: 'Make a statement with this high-contrast power lifting inspired graphic tee.',
      image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Powerlifting%20Graphic%20Tshirt&image_size=landscape_4_3' 
    }
  ];

  selections: { [key: number]: Selection } = {};

  constructor() {
    this.allProducts.forEach(p => {
      this.selections[p.id] = {
        color: p.colors[0],
        size: p.sizes[0],
        quantity: 1
      };
    });
  }

  processedProducts = computed(() => {
    let list = [...this.allProducts];
    const query = this.searchQuery().toLowerCase().trim();
    if (query) list = list.filter(p => p.name.toLowerCase().includes(query));
    if (this.activeCategory() !== 'all') list = list.filter(p => p.category === this.activeCategory());
    return list;
  });

  trackById(index: number, item: Product) { return item.id; }

  openSelectionModal(product: Product, mode: 'buy' | 'cart' = 'buy') {
    this.selectionMode.set(mode);
    this.activeSelectionProduct.set(product);
  }

  updateSelection(productId: number, type: 'color' | 'size', value: string) {
    if (type === 'color') this.selections[productId].color = value;
    if (type === 'size') this.selections[productId].size = value;
  }

  updateQty(productId: number, change: number) {
    const newQty = this.selections[productId].quantity + change;
    if (newQty >= 1 && newQty <= 10) this.selections[productId].quantity = newQty;
  }

  onSelectionNext() {
    if (this.selectionMode() === 'buy') {
      this.isCheckoutMode.set(true);
    } else {
      this.confirmAddToCart();
    }
  }

  confirmAddToCart() {
    const product = this.activeSelectionProduct()!;
    const selection = this.selections[product.id];
    
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: selection.quantity,
      color: selection.color,
      size: selection.size,
      image: product.image
    };

    this.addToCart.emit(cartItem);
    this.notificationText.set('Added to Cart!');
    this.showNotification.set(true);
    this.activeSelectionProduct.set(null);
    setTimeout(() => this.showNotification.set(false), 2000);
  }

  validateContact(val: string) {
    this.customerInfo.contact = val.replace(/\D/g, '').slice(0, 11);
  }

  isFormValid() {
    return this.customerInfo.name.trim().length > 0 && 
           this.customerInfo.address.trim().length > 0 && 
           this.customerInfo.contact.length === 11;
  }

  confirmOrder() {
    if (this.isAddingToCart() || !this.isFormValid()) return;
    
    const product = this.activeSelectionProduct()!;
    const selection = this.selections[product.id];
    
    const newOrder: Order = {
      id: 'DF-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      total: product.price * selection.quantity,
      status: 'Processing',
      trackingNumber: 'TRK' + Math.floor(10000000 + Math.random() * 90000000),
      customerName: this.customerInfo.name,
      address: this.customerInfo.address,
      contactNumber: this.customerInfo.contact,
      items: [{
        name: product.name,
        price: product.price,
        quantity: selection.quantity,
        color: selection.color,
        size: selection.size
      }]
    };

    this.isAddingToCart.set(true);
    
    setTimeout(() => {
      this.addOrder.emit(newOrder);
      this.notificationText.set('Order Placed Successfully!');
      this.showNotification.set(true);
      this.isAddingToCart.set(false);
      this.activeSelectionProduct.set(null);
      this.isCheckoutMode.set(false);
      
      // Reset form
      this.customerInfo = { name: '', address: '', contact: '' };
      
      setTimeout(() => this.showNotification.set(false), 3000);
    }, 800);
  }
}
