import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shop } from './shop';
import { Orders, Order } from './orders';
import { Cart, CartItem } from './cart';

const CART_KEY = 'dailyfit_cart';
const ORDERS_KEY = 'dailyfit_orders';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, Shop, Orders, Cart],
  template: `
    <app-shop 
      *ngIf="currentView() === 'shop'"
      [cartCount]="cartTotalItems()"
      (viewOrders)="currentView.set('orders')"
      (viewCart)="currentView.set('cart')"
      (addToCart)="onAddToCart($event)"
      (addOrder)="onAddOrder($event)"
    />
    
    <app-cart
      *ngIf="currentView() === 'cart'"
      [items]="cartItems()"
      (goBack)="currentView.set('shop')"
      (removeItem)="onRemoveFromCart($event)"
      (updateItemQty)="onUpdateCartQty($event)"
      (onCheckout)="onStartCheckout()"
    />

    <app-orders 
      *ngIf="currentView() === 'orders'"
      [orders]="ordersList()"
      (goBack)="currentView.set('shop')"
      (cancelOrder)="onCancelOrder($event)"
      (updateOrder)="onUpdateOrder($event)"
    />
  `,
})
export class App {
  currentView = signal<'shop' | 'orders' | 'cart'>('shop');
  ordersList = signal<Order[]>(loadOrders());
  cartItems = signal<CartItem[]>(loadCart());

  cartTotalItems = () => this.cartItems().reduce((acc, item) => acc + item.quantity, 0);

  // Persist cart and orders to localStorage whenever they change
  private cartEffect = effect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(this.cartItems()));
  });

  private ordersEffect = effect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(this.ordersList()));
  });

  onAddToCart(item: CartItem) {
    this.cartItems.update(items => {
      const existing = items.find(i => i.id === item.id && i.color === item.color && i.size === item.size);
      if (existing) {
        return items.map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...items, item];
    });
  }

  onRemoveFromCart(item: CartItem) {
    this.cartItems.update(items => items.filter(i => i !== item));
  }

  onUpdateCartQty({item, change}: {item: CartItem, change: number}) {
    this.cartItems.update(items => items.map(i => i === item ? { ...i, quantity: i.quantity + change } : i));
  }

  onStartCheckout() {
    this.currentView.set('shop');
    // We could add a signal to trigger checkout in Shop, 
    // but for now, the user can just use the Shop's BUY button.
    // To make it truly functional, let's add a checkout modal in App or a separate component.
  }

  onAddOrder(order: Order) {
    this.ordersList.update(list => [order, ...list]);
  }

  onCancelOrder(orderId: string) {
    this.ordersList.update(list => 
      list.map(o => o.id === orderId ? { ...o, status: 'Cancelled' as const } : o)
    );
  }

  onUpdateOrder(updatedOrder: Order) {
    this.ordersList.update(list => 
      list.map(o => o.id === updatedOrder.id ? updatedOrder : o)
    );
  }
}
