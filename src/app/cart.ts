import { Component, signal, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderItem } from './orders';

export interface CartItem extends OrderItem {
  id: number; // Product ID
  image: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cart-container">
      <header class="header">
        <div class="logo-container" (click)="goBack.emit()">
          <h1 class="daily-fit">DAILY FIT</h1>
          <span class="shop-text">cart</span>
        </div>
        
        <button class="back-btn" (click)="goBack.emit()">
          ← BACK TO SHOP
        </button>
      </header>

      <main class="cart-content">
        <h2 class="section-title">Your Cart</h2>
        
        <div class="cart-list" *ngIf="items.length > 0">
          <div class="cart-item-card" *ngFor="let item of items">
            <div class="item-img">
              <img [src]="item.image" [alt]="item.name">
            </div>
            <div class="item-info">
              <div class="item-header">
                <h3>{{item.name}}</h3>
                <button class="remove-btn" (click)="removeItem.emit(item)">✕</button>
              </div>
              <p class="item-meta">{{item.color}} | {{item.size}}</p>
              <div class="item-footer">
                <div class="qty-control">
                  <button (click)="updateQty(item, -1)">-</button>
                  <span>{{item.quantity}}</span>
                  <button (click)="updateQty(item, 1)">+</button>
                </div>
                <span class="item-price">₱{{item.price * item.quantity}}</span>
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₱{{total()}}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span class="free">FREE</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>₱{{total()}}</span>
            </div>
            <button class="checkout-btn" (click)="onCheckout.emit()">
              CHECKOUT NOW
            </button>
          </div>
        </div>

        <div class="empty-cart" *ngIf="items.length === 0">
          <p>Your cart is empty.</p>
          <button class="shop-now-btn" (click)="goBack.emit()">SHOP NOW</button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .cart-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #000000 0%, #434343 100%);
      color: white;
      padding: 40px 20px;
      font-family: 'Inter', sans-serif;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 50px;
      max-width: 1000px;
      margin-inline: auto;
    }

    .logo-container {
      position: relative;
      transform: rotate(-15deg);
      cursor: pointer;
    }

    .daily-fit {
      font-family: 'Bangers', cursive;
      font-size: 60px;
      color: #fff;
      margin: 0;
      line-height: 1;
      text-shadow: 4px 4px 0px #333;
      -webkit-text-stroke: 1px #fff;
    }

    .shop-text {
      font-family: 'Permanent Marker', cursive;
      font-size: 30px;
      color: #ff4d4d;
      position: absolute;
      bottom: -15px;
      right: -15px;
      transform: rotate(10deg);
    }

    .back-btn {
      background: transparent;
      border: 2px solid #555;
      color: #ccc;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
    }

    .cart-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .section-title {
      font-family: 'Bangers', cursive;
      font-size: 36px;
      letter-spacing: 2px;
      margin-bottom: 30px;
      border-bottom: 2px solid #ff3333;
      display: inline-block;
    }

    .cart-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .cart-item-card {
      background: #1a1a1a;
      border: 2px solid #333;
      border-radius: 12px;
      padding: 15px;
      display: flex;
      gap: 20px;
    }

    .item-img {
      width: 100px;
      height: 100px;
      background: #222;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #333;
    }

    .item-img img {
      width: 100%;
      height: 105%;
      object-fit: cover;
      object-position: top;
      opacity: 0.9;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .item-header h3 {
      margin: 0;
      font-size: 18px;
      text-transform: uppercase;
    }

    .remove-btn {
      background: transparent;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 18px;
    }

    .remove-btn:hover { color: #ff3333; }

    .item-meta {
      color: #888;
      font-size: 12px;
      margin: 5px 0;
      text-transform: uppercase;
    }

    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .qty-control {
      display: flex;
      align-items: center;
      background: #222;
      border-radius: 4px;
      border: 1px solid #444;
    }

    .qty-control button {
      background: transparent;
      border: none;
      color: white;
      padding: 5px 12px;
      cursor: pointer;
    }

    .qty-control span {
      padding: 0 10px;
      font-weight: bold;
    }

    .item-price {
      font-weight: bold;
      font-size: 18px;
    }

    .cart-summary {
      background: #1a1a1a;
      border: 2px solid #333;
      border-radius: 16px;
      padding: 30px;
      margin-top: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      position: sticky;
      bottom: 20px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      color: #aaa;
      font-size: 16px;
    }

    .summary-row.total {
      color: white;
      font-size: 28px;
      font-weight: 800;
      border-top: 2px solid #333;
      padding-top: 20px;
      margin-top: 10px;
      font-family: 'Bangers', cursive;
      letter-spacing: 1px;
    }

    .free { color: #00ff88; font-weight: bold; text-shadow: 0 0 10px rgba(0,255,136,0.3); }

    .checkout-btn {
      width: 100%;
      background: linear-gradient(90deg, #ff3333 0%, #cc0000 100%);
      color: white;
      border: none;
      padding: 18px;
      border-radius: 12px;
      font-weight: 900;
      font-size: 20px;
      cursor: pointer;
      margin-top: 25px;
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 2px;
      box-shadow: 0 4px 15px rgba(255, 51, 51, 0.4);
    }

    .checkout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 51, 51, 0.6);
      filter: brightness(1.1);
    }

    .empty-cart {
      text-align: center;
      padding: 60px 0;
    }

    .empty-cart p { color: #888; margin-bottom: 20px; }

    .shop-now-btn {
      background: #ff3333;
      color: white;
      border: none;
      padding: 10px 30px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
    }
  `]
})
export class Cart {
  @Input() items: CartItem[] = [];
  @Output() goBack = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<CartItem>();
  @Output() updateItemQty = new EventEmitter<{item: CartItem, change: number}>();
  @Output() onCheckout = new EventEmitter<void>();

  total = computed(() => {
    return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  });

  updateQty(item: CartItem, change: number) {
    if (item.quantity + change >= 1) {
      this.updateItemQty.emit({item, change});
    }
  }
}
