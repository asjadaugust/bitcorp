# Progressive Web App (PWA) Implementation Guide

## Overview

This guide outlines the implementation of Progressive Web App features for Bitcorp ERP, transforming the web application into a mobile-first, app-like experience that works across all devices and platforms.

## PWA Core Concepts

### PWA Principles

Based on best practices from "Building Large Scale Web Apps" by Addy Osmani:

1. **Progressive**: Works for every user, regardless of browser choice
2. **Responsive**: Fits any form factor (desktop, mobile, tablet)
3. **Connectivity Independent**: Works offline or with poor connectivity
4. **App-like**: Native app feel with app-style interactions
5. **Fresh**: Always up-to-date thanks to service workers
6. **Safe**: Served via HTTPS to prevent tampering
7. **Discoverable**: Identifiable as applications via web app manifests
8. **Re-engageable**: Push notifications for user engagement
9. **Installable**: Users can install to their home screen
10. **Linkable**: Easily shared via URL

### PWA Architecture

```typescript
// frontend/src/pwa/pwa-manager.ts

export class PWAManager {
  private static instance: PWAManager
  private swRegistration: ServiceWorkerRegistration | null = null
  private deferredPrompt: any = null
  
  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager()
    }
    return PWAManager.instance
  }
  
  async initialize(): Promise<void> {
    await this.registerServiceWorker()
    this.setupInstallPrompt()
    this.setupNetworkStatus()
    this.setupPushNotifications()
  }
  
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        
        console.log('Service Worker registered:', this.swRegistration.scope)
        
        // Handle updates
        this.swRegistration.addEventListener('updatefound', () => {
          this.handleServiceWorkerUpdate()
        })
        
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }
  
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      this.showInstallBanner()
    })
    
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      this.hideInstallBanner()
      this.trackInstallEvent()
    })
  }
  
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) return false
    
    this.deferredPrompt.prompt()
    const { outcome } = await this.deferredPrompt.userChoice
    
    console.log(`User response to install prompt: ${outcome}`)
    this.deferredPrompt = null
    
    return outcome === 'accepted'
  }
}
```

## Web App Manifest

### Manifest Configuration

```json
// frontend/public/manifest.json

{
  "name": "Bitcorp ERP - Equipment Management",
  "short_name": "Bitcorp ERP",
  "description": "Comprehensive ERP system for civil works equipment management",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#1976d2",
  "background_color": "#ffffff",
  "categories": ["business", "productivity", "utilities"],
  "lang": "en-US",
  "dir": "ltr",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop-dashboard.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Dashboard view on desktop"
    },
    {
      "src": "/screenshots/mobile-equipment-list.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Equipment list on mobile"
    }
  ],
  "shortcuts": [
    {
      "name": "Equipment List",
      "short_name": "Equipment",
      "description": "View all equipment",
      "url": "/equipment",
      "icons": [
        {
          "src": "/icons/equipment-shortcut.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Add Equipment",
      "short_name": "Add",
      "description": "Add new equipment",
      "url": "/equipment/new",
      "icons": [
        {
          "src": "/icons/add-shortcut.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Reports",
      "short_name": "Reports",
      "description": "View reports",
      "url": "/reports",
      "icons": [
        {
          "src": "/icons/reports-shortcut.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
```

## Service Worker Implementation

### Advanced Service Worker

```typescript
// frontend/public/sw.js

const CACHE_NAME = 'bitcorp-erp-v1.0.0'
const RUNTIME_CACHE = 'bitcorp-runtime'
const API_CACHE = 'bitcorp-api'

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/v1/equipment',
  '/api/v1/auth/me',
  '/api/v1/reports/equipment-utilization'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME && 
                                cacheName !== RUNTIME_CACHE && 
                                cacheName !== API_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request))
    return
  }
  
  // Handle static assets
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    event.respondWith(handleStaticAssets(request))
    return
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
  
  // Default: network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})

// API Request Handler - Network first with fallback
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      // Add offline indicator header
      const response = cachedResponse.clone()
      response.headers.set('X-Served-From', 'cache')
      return response
    }
    
    // Return offline page for failed requests
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({
          error: 'Network unavailable',
          message: 'This data is not available offline'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    throw error
  }
}

// Static Assets Handler - Cache first
async function handleStaticAssets(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    // Return placeholder for failed image requests
    if (request.destination === 'image') {
      return new Response(
        '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em">Image Unavailable</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      )
    }
    throw error
  }
}

// Navigation Handler - App shell pattern
async function handleNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    // Fallback to cached app shell
    const cachedResponse = await cache.match('/') || 
                          await caches.match('/')
    return cachedResponse || new Response('Offline')
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineActions())
  }
})

async function syncOfflineActions() {
  // Retrieve offline actions from IndexedDB
  const offlineActions = await getOfflineActions()
  
  for (const action of offlineActions) {
    try {
      await processOfflineAction(action)
      await removeOfflineAction(action.id)
    } catch (error) {
      console.error('Failed to sync offline action:', error)
    }
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Bitcorp ERP', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})
```

## Offline Strategy

### Offline Data Management

```typescript
// frontend/src/offline/offline-manager.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface OfflineDB extends DBSchema {
  equipment: {
    key: string
    value: {
      id: string
      data: any
      timestamp: number
      synced: boolean
    }
  }
  actions: {
    key: string
    value: {
      id: string
      type: 'create' | 'update' | 'delete'
      endpoint: string
      data: any
      timestamp: number
      retries: number
    }
  }
  metadata: {
    key: string
    value: {
      lastSync: number
      version: string
    }
  }
}

export class OfflineManager {
  private db: IDBPDatabase<OfflineDB> | null = null
  private syncInProgress = false
  
  async initialize(): Promise<void> {
    this.db = await openDB<OfflineDB>('bitcorp-offline', 1, {
      upgrade(db) {
        // Equipment store
        if (!db.objectStoreNames.contains('equipment')) {
          db.createObjectStore('equipment', { keyPath: 'id' })
        }
        
        // Offline actions store
        if (!db.objectStoreNames.contains('actions')) {
          const actionStore = db.createObjectStore('actions', { keyPath: 'id' })
          actionStore.createIndex('timestamp', 'timestamp')
        }
        
        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' })
        }
      }
    })
    
    // Setup periodic sync
    this.setupPeriodicSync()
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
  }
  
  async cacheEquipment(equipment: any[]): Promise<void> {
    if (!this.db) return
    
    const tx = this.db.transaction('equipment', 'readwrite')
    
    for (const item of equipment) {
      await tx.store.put({
        id: item.id,
        data: item,
        timestamp: Date.now(),
        synced: true
      })
    }
    
    await tx.done
  }
  
  async getCachedEquipment(): Promise<any[]> {
    if (!this.db) return []
    
    const items = await this.db.getAll('equipment')
    return items.map(item => item.data)
  }
  
  async queueOfflineAction(
    type: 'create' | 'update' | 'delete',
    endpoint: string,
    data: any
  ): Promise<void> {
    if (!this.db) return
    
    const action = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      endpoint,
      data,
      timestamp: Date.now(),
      retries: 0
    }
    
    await this.db.add('actions', action)
    
    // Try to sync if online
    if (navigator.onLine) {
      this.syncOfflineActions()
    }
  }
  
  async syncOfflineActions(): Promise<void> {
    if (!this.db || this.syncInProgress) return
    
    this.syncInProgress = true
    
    try {
      const actions = await this.db.getAll('actions')
      
      for (const action of actions.sort((a, b) => a.timestamp - b.timestamp)) {
        try {
          await this.processOfflineAction(action)
          await this.db.delete('actions', action.id)
        } catch (error) {
          console.error('Failed to sync action:', error)
          
          // Increment retry count
          action.retries++
          
          if (action.retries < 3) {
            await this.db.put('actions', action)
          } else {
            // Remove action after 3 failed attempts
            await this.db.delete('actions', action.id)
            this.notifyUserOfFailedSync(action)
          }
        }
      }
    } finally {
      this.syncInProgress = false
    }
  }
  
  private async processOfflineAction(action: any): Promise<void> {
    const response = await fetch(action.endpoint, {
      method: action.type === 'create' ? 'POST' : 
              action.type === 'update' ? 'PUT' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: action.type !== 'delete' ? JSON.stringify(action.data) : undefined
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }
  
  private setupPeriodicSync(): void {
    // Sync every 30 seconds when online
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncOfflineActions()
      }
    }, 30000)
  }
  
  private handleOnline(): void {
    console.log('Back online - syncing offline actions')
    this.syncOfflineActions()
    this.showOnlineNotification()
  }
  
  private handleOffline(): void {
    console.log('Gone offline - queueing actions')
    this.showOfflineNotification()
  }
  
  private showOnlineNotification(): void {
    // Show user-friendly online notification
    this.showNotification('Back online', 'Syncing your changes...', 'success')
  }
  
  private showOfflineNotification(): void {
    // Show user-friendly offline notification
    this.showNotification('You\'re offline', 'Changes will sync when you\'re back online', 'warning')
  }
  
  private notifyUserOfFailedSync(action: any): void {
    this.showNotification(
      'Sync failed',
      `Failed to sync ${action.type} action after multiple attempts`,
      'error'
    )
  }
  
  private showNotification(title: string, message: string, type: 'success' | 'warning' | 'error'): void {
    // Implement notification display logic
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`)
  }
  
  private getAuthToken(): string {
    // Get auth token from storage
    return localStorage.getItem('auth_token') || ''
  }
}
```

## Push Notifications

### Push Notification System

```typescript
// frontend/src/notifications/push-manager.ts

export class PushNotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null
  
  constructor(swRegistration: ServiceWorkerRegistration) {
    this.swRegistration = swRegistration
  }
  
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }
    
    if (Notification.permission === 'granted') {
      return true
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    
    return false
  }
  
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error('Service Worker not registered')
      return null
    }
    
    try {
      const existingSubscription = await this.swRegistration.pushManager.getSubscription()
      
      if (existingSubscription) {
        return existingSubscription
      }
      
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
        )
      })
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)
      
      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }
  
  async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send subscription to server')
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error)
    }
  }
  
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.swRegistration) return false
    
    try {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        await this.removeSubscriptionFromServer(subscription)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }
  
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/v1/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })
    } catch (error) {
      console.error('Error removing subscription from server:', error)
    }
  }
  
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    return outputArray
  }
  
  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || ''
  }
}
```

### Backend Push Notification Service

```python
# backend/app/services/push_notifications.py

import json
from pywebpush import webpush, WebPushException
from app.core.config import settings
from app.models.notification import PushSubscription

class PushNotificationService:
    def __init__(self):
        self.vapid_private_key = settings.VAPID_PRIVATE_KEY
        self.vapid_public_key = settings.VAPID_PUBLIC_KEY
        self.vapid_claims = {
            "sub": f"mailto:{settings.VAPID_EMAIL}"
        }
    
    async def send_notification(
        self,
        subscription: PushSubscription,
        title: str,
        body: str,
        data: dict = None,
        actions: list = None
    ):
        """Send push notification to a specific subscription"""
        
        payload = {
            "title": title,
            "body": body,
            "icon": "/icons/icon-192x192.png",
            "badge": "/icons/badge-72x72.png",
            "data": data or {},
            "actions": actions or []
        }
        
        try:
            webpush(
                subscription_info={
                    "endpoint": subscription.endpoint,
                    "keys": {
                        "p256dh": subscription.p256dh_key,
                        "auth": subscription.auth_key
                    }
                },
                data=json.dumps(payload),
                vapid_private_key=self.vapid_private_key,
                vapid_claims=self.vapid_claims
            )
            
        except WebPushException as e:
            print(f"Push notification failed: {e}")
            
            # Handle expired/invalid subscriptions
            if e.response and e.response.status_code in [400, 410]:
                await self.remove_invalid_subscription(subscription)
    
    async def send_equipment_alert(self, user_id: str, equipment_name: str, alert_type: str):
        """Send equipment-related alert"""
        
        subscriptions = await self.get_user_subscriptions(user_id)
        
        title = f"Equipment Alert: {equipment_name}"
        body = f"{alert_type} alert for {equipment_name}"
        
        data = {
            "type": "equipment_alert",
            "equipment_name": equipment_name,
            "alert_type": alert_type,
            "url": f"/equipment/{equipment_name}"
        }
        
        actions = [
            {
                "action": "view",
                "title": "View Equipment",
                "icon": "/icons/view.png"
            },
            {
                "action": "dismiss",
                "title": "Dismiss",
                "icon": "/icons/dismiss.png"
            }
        ]
        
        for subscription in subscriptions:
            await self.send_notification(
                subscription,
                title,
                body,
                data,
                actions
            )
    
    async def send_maintenance_reminder(self, user_id: str, equipment_name: str, due_date: str):
        """Send maintenance reminder"""
        
        subscriptions = await self.get_user_subscriptions(user_id)
        
        title = "Maintenance Reminder"
        body = f"{equipment_name} maintenance due on {due_date}"
        
        data = {
            "type": "maintenance_reminder",
            "equipment_name": equipment_name,
            "due_date": due_date,
            "url": f"/equipment/{equipment_name}/maintenance"
        }
        
        for subscription in subscriptions:
            await self.send_notification(subscription, title, body, data)
```

## Mobile-Responsive Design

### Responsive Components

```typescript
// frontend/src/components/responsive/EquipmentMobileCard.tsx

import React from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  MoreVert as MoreIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { Equipment } from '../../types/equipment'

interface EquipmentMobileCardProps {
  equipment: Equipment
  onSelect: (equipment: Equipment) => void
  onMenuClick: (equipment: Equipment, anchorEl: HTMLElement) => void
}

export const EquipmentMobileCard: React.FC<EquipmentMobileCardProps> = ({
  equipment,
  onSelect,
  onMenuClick
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    onMenuClick(equipment, event.currentTarget)
  }
  
  const handleCardClick = () => {
    onSelect(equipment)
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'maintenance': return 'warning'
      case 'retired': return 'error'
      default: return 'default'
    }
  }
  
  return (
    <Card
      sx={{
        mb: 1,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: theme.shadows[4]
        },
        '&:active': {
          transform: 'scale(0.98)',
          transition: 'transform 0.1s'
        }
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1} minWidth={0}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontSize: isMobile ? '1rem' : '1.25rem',
                fontWeight: 600,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {equipment.name}
            </Typography>
            
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {equipment.serialNumber}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Chip
                label={equipment.status}
                color={getStatusColor(equipment.status)}
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
              <Typography variant="body2" fontWeight="bold">
                ${equipment.cost.toLocaleString()}
              </Typography>
            </Box>
            
            {isMobile && (
              <Box>
                {equipment.location && (
                  <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {equipment.location}
                    </Typography>
                  </Box>
                )}
                
                {equipment.assignedOperator && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {equipment.assignedOperator.name}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
          
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{ ml: 1 }}
          >
            <MoreIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  )
}
```

### Touch-Friendly Interactions

```typescript
// frontend/src/hooks/useTouch.ts

import { useState, useRef, useCallback } from 'react'

interface TouchHandlers {
  onTouchStart: (event: React.TouchEvent) => void
  onTouchMove: (event: React.TouchEvent) => void
  onTouchEnd: (event: React.TouchEvent) => void
}

interface UseTouchOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onLongPress?: () => void
  threshold?: number
  longPressDelay?: number
}

export const useTouch = (options: UseTouchOptions = {}): TouchHandlers => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    threshold = 50,
    longPressDelay = 500
  } = options
  
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  
  const onTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    
    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress()
      }, longPressDelay)
    }
  }, [onLongPress, longPressDelay])
  
  const onTouchMove = useCallback((event: React.TouchEvent) => {
    // Cancel long press on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])
  
  const onTouchEnd = useCallback((event: React.TouchEvent) => {
    // Cancel long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    
    if (!touchStart) return
    
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }
    }
    
    setTouchStart(null)
  }, [touchStart, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])
  
  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
}
```

## Installation and Deployment

### PWA Installation Component

```typescript
// frontend/src/components/PWAInstallPrompt.tsx

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton
} from '@mui/material'
import {
  Close as CloseIcon,
  GetApp as InstallIcon
} from '@mui/icons-material'

interface PWAInstallPromptProps {
  onInstall?: () => void
  onDismiss?: () => void
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }
    
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setShowPrompt(false)
      onInstall?.()
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [onInstall])
  
  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }
  
  const handleDismiss = () => {
    setShowPrompt(false)
    onDismiss?.()
  }
  
  if (!showPrompt || !deferredPrompt) {
    return null
  }
  
  return (
    <Dialog
      open={showPrompt}
      onClose={handleDismiss}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Install Bitcorp ERP</Typography>
          <IconButton onClick={handleDismiss} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box textAlign="center" py={2}>
          <InstallIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="body1" paragraph>
            Install Bitcorp ERP for a better experience with:
          </Typography>
          <Box component="ul" textAlign="left" sx={{ mt: 2 }}>
            <li>Offline access to your equipment data</li>
            <li>Faster loading and better performance</li>
            <li>Home screen access</li>
            <li>Push notifications for important updates</li>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleDismiss} color="inherit">
          Not Now
        </Button>
        <Button
          onClick={handleInstallClick}
          variant="contained"
          startIcon={<InstallIcon />}
        >
          Install App
        </Button>
      </DialogActions>
    </Dialog>
  )
}
```

This comprehensive PWA implementation transforms the Bitcorp ERP web application into a mobile-first, app-like experience with offline capabilities, push notifications, and native app features while maintaining cross-platform compatibility.
