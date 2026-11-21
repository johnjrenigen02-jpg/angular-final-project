import { Component, signal, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber: string;
  items: OrderItem[];
  customerName: string;
  address: string;
  contactNumber: string;
  paymentMethod: 'Cash on Delivery' | 'GCash';
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-container">
      <header class="header">
        <div class="logo-container" (click)="goBack.emit()">
          <h1 class="daily-fit">DAILY FIT</h1>
          <span class="shop-text">orders</span>
        </div>
        
        <button class="back-btn" (click)="goBack.emit()">
          ← BACK TO SHOP
        </button>
      </header>

      <main class="orders-content">
        <h2 class="section-title">Order History</h2>
        
        <div class="orders-list">
          <div class="order-card" *ngFor="let order of orders" [class.cancelled-order]="order.status === 'Cancelled'">
            <div class="order-header">
              <div class="order-info">
                <span class="order-id">ORDER #{{order.id}}</span>
                <span class="order-date">{{order.date}}</span>
              </div>
              <div class="status-group">
                <div class="order-status" [class]="order.status.toLowerCase()">
                  {{order.status}}
                </div>
              </div>
            </div>

            <div class="order-body">
              <div class="delivery-details">
                <div class="detail-header">
                  <h4>Delivery Information</h4>
                  <button class="edit-btn" *ngIf="order.status === 'Processing'" (click)="openEditModal(order)">EDIT</button>
                </div>
                <p><strong>Name:</strong> {{order.customerName}}</p>
                <p><strong>Contact:</strong> {{order.contactNumber}}</p>
                <p><strong>Address:</strong> {{order.address}}</p>
                <p><strong>Payment:</strong> <span class="payment-tag" [class.cod]="order.paymentMethod === 'Cash on Delivery'" [class.gcash]="order.paymentMethod === 'GCash'">{{order.paymentMethod}}</span></p>
              </div>

              <div class="order-items">
                <div class="item-row" *ngFor="let item of order.items">
                  <div class="item-details">
                    <span class="item-name">{{item.name}} x {{item.quantity}}</span>
                    <span class="item-meta">{{item.color}} | {{item.size}}</span>
                  </div>
                  <span class="item-price">₱{{item.price * item.quantity}}</span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <div class="tracking-info">
                <span class="label">Tracking:</span>
                <span class="value">{{order.trackingNumber}}</span>
                <button class="track-btn" (click)="trackOrder(order.trackingNumber)">TRACK</button>
              </div>
              <div class="footer-actions">
                <div class="total-info">
                  <span class="label">Total:</span>
                  <span class="total-amount">₱{{order.total}}</span>
                </div>
                <button class="cancel-order-btn" 
                        *ngIf="order.status === 'Processing'" 
                        (click)="cancelOrder.emit(order.id)">
                  CANCEL ORDER
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="no-orders" *ngIf="orders.length === 0">
          <p>You haven't placed any orders yet.</p>
        </div>
      </main>

      <!-- Edit Delivery Info Modal -->
      <div class="modal-overlay" *ngIf="editingOrder()">
        <div class="modal-content edit-modal">
          <h3>Edit Delivery Information</h3>
          <div class="form-group">
            <label>Name</label>
            <input type="text" [(ngModel)]="editForm.customerName" placeholder="Enter full name" />
          </div>
          <div class="form-group">
            <label>Contact Number (11 digits)</label>
            <input 
              type="text" 
              [(ngModel)]="editForm.contactNumber" 
              (ngModelChange)="validateContact($event)"
              placeholder="09XXXXXXXXX" 
              maxlength="11"
            />
          </div>
          <div class="form-group">
            <label>Delivery Address</label>
            <textarea [(ngModel)]="editForm.address" placeholder="Enter full delivery address"></textarea>
          </div>
          <div class="modal-actions">
            <button class="save-btn" [disabled]="!isEditFormValid()" (click)="saveEdit()">SAVE CHANGES</button>
            <button class="close-btn secondary" (click)="editingOrder.set(null)">CANCEL</button>
          </div>
        </div>
      </div>

      <!-- Tracking Modal Mock -->
      <div class="modal-overlay" *ngIf="activeTracking()">
        <div class="modal-content">
          <h3>Tracking: {{activeTracking()}}</h3>
          <div class="tracking-steps">
            <div class="step completed">
              <div class="dot"></div>
              <div class="info">Order Placed</div>
            </div>
            <div class="step active">
              <div class="dot"></div>
              <div class="info">Processing</div>
            </div>
            <div class="step">
              <div class="dot"></div>
              <div class="info">In Transit</div>
            </div>
            <div class="step">
              <div class="dot"></div>
              <div class="info">Delivered</div>
            </div>
          </div>
          <button class="close-btn" (click)="activeTracking.set(null)">CLOSE</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
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
      transition: transform 0.3s;
    }

    .logo-container:hover {
      transform: rotate(-10deg) scale(1.05);
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
      transition: all 0.2s;
    }

    .back-btn:hover {
      border-color: #fff;
      color: #fff;
      background: rgba(255,255,255,0.1);
    }

    .orders-content {
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
      padding-bottom: 5px;
    }

    .orders-list {
      display: grid;
      gap: 25px;
    }

    .order-card {
      background: #1a1a1a;
      border: 2px solid #333;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s;
    }

    .order-card:hover {
      border-color: #444;
    }

    .cancelled-order {
      opacity: 0.6;
      border-color: #331111;
    }

    .payment-tag {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 4px;
    }

    .payment-tag.cod {
      background: rgba(40, 167, 69, 0.2);
      color: #28a745;
      border: 1px solid #28a745;
    }

    .payment-tag.gcash {
      background: rgba(64, 191, 255, 0.2);
      color: #40bfff;
      border: 1px solid #40bfff;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #333;
    }

    .order-id {
      font-weight: bold;
      font-size: 18px;
      display: block;
    }

    .order-date {
      color: #888;
      font-size: 14px;
    }

    .order-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .order-status.processing { background: #333; color: #aaa; }
    .order-status.shipped { background: #d4af37; color: #000; }
    .order-status.delivered { background: #28a745; color: #fff; }
    .order-status.cancelled { background: #ff3333; color: #fff; }

    .order-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .delivery-details {
      background: #222;
      padding: 15px;
      border-radius: 8px;
      font-size: 14px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .detail-header h4 {
      margin: 0;
      color: #ff3333;
      font-size: 14px;
      text-transform: uppercase;
    }

    .delivery-details p {
      margin: 5px 0;
      color: #ccc;
    }

    .delivery-details strong {
      color: #888;
      width: 80px;
      display: inline-block;
    }

    .edit-btn {
      background: transparent;
      border: 1px solid #ff3333;
      color: #ff3333;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      cursor: pointer;
    }

    .edit-btn:hover {
      background: #ff3333;
      color: #fff;
    }

    .order-items {
      background: #222;
      padding: 15px;
      border-radius: 8px;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      color: #ccc;
      margin-bottom: 12px;
    }

    .item-details {
      display: flex;
      flex-direction: column;
    }

    .item-name {
      font-weight: 500;
    }

    .item-meta {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid #333;
    }

    .footer-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .tracking-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .label { color: #666; font-size: 14px; }
    .value { font-family: monospace; color: #d4af37; }

    .track-btn {
      background: #333;
      color: #fff;
      border: 1px solid #444;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }

    .track-btn:hover { background: #444; }

    .total-amount {
      font-size: 24px;
      font-weight: bold;
      color: #fff;
      margin-left: 8px;
    }

    .cancel-order-btn {
      background: transparent;
      border: 1px solid #ff3333;
      color: #ff3333;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cancel-order-btn:hover {
      background: #ff3333;
      color: #fff;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .modal-content {
      background: #1a1a1a;
      border: 2px solid #ff3333;
      padding: 30px;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
    }

    .edit-modal h3 {
      margin-top: 0;
      margin-bottom: 25px;
      color: #fff;
      font-family: 'Bangers', cursive;
      letter-spacing: 1px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #888;
      font-size: 12px;
      font-weight: bold;
    }

    .form-group input, .form-group textarea {
      width: 100%;
      background: #222;
      border: 1px solid #333;
      color: #fff;
      padding: 10px;
      border-radius: 6px;
      font-family: inherit;
    }

    .form-group textarea {
      height: 80px;
      resize: none;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 25px;
    }

    .save-btn {
      flex: 1;
      background: #ff3333;
      color: #fff;
      border: none;
      padding: 10px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
    }

    .save-btn:hover {
      background: #ff4d4d;
    }

    .close-btn {
      flex: 1;
      background: #ff3333;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
    }

    .close-btn.secondary {
      background: #333;
    }

    .tracking-steps {
      margin: 30px 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 15px;
      color: #666;
    }

    .step.completed { color: #28a745; }
    .step.active { color: #fff; font-weight: bold; }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: currentColor;
    }

    @media (max-width: 768px) {
      .header { flex-direction: column; gap: 20px; align-items: center; }
      .order-body { grid-template-columns: 1fr; }
      .order-footer { flex-direction: column; gap: 15px; align-items: flex-start; }
      .footer-actions { width: 100%; justify-content: space-between; }
    }
  `]
})
export class Orders {
  @Input() orders: Order[] = [];
  @Output() goBack = new EventEmitter<void>();
  @Output() cancelOrder = new EventEmitter<string>();
  @Output() updateOrder = new EventEmitter<Order>();

  activeTracking = signal<string | null>(null);
  editingOrder = signal<Order | null>(null);

  editForm = {
    customerName: '',
    address: '',
    contactNumber: ''
  };

  trackOrder(num: string) {
    this.activeTracking.set(num);
  }

  validateContact(val: string) {
    this.editForm.contactNumber = val.replace(/\D/g, '').slice(0, 11);
  }

  isEditFormValid() {
    return this.editForm.customerName.trim().length > 0 && 
           this.editForm.address.trim().length > 0 && 
           this.editForm.contactNumber.length === 11;
  }

  openEditModal(order: Order) {
    this.editingOrder.set(order);
    this.editForm = {
      customerName: order.customerName,
      address: order.address,
      contactNumber: order.contactNumber
    };
  }

  saveEdit() {
    const currentOrder = this.editingOrder();
    if (currentOrder) {
      const updatedOrder: Order = {
        ...currentOrder,
        customerName: this.editForm.customerName,
        address: this.editForm.address,
        contactNumber: this.editForm.contactNumber
      };
      this.updateOrder.emit(updatedOrder);
      this.editingOrder.set(null);
    }
  }
}
