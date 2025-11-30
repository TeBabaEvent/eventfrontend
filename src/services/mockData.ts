import type { Event, Artist, GalleryItem } from '@/types'
import { i18n } from '@/i18n'

const { t } = i18n.global

export function getMockEvents(): Event[] {
  return [
    {
      id: '1',
      title: t('mockData.events.event1.title'),
      description: t('mockData.events.event1.description'),
      category: 'concert' as const,
      date: '2024-12-15',
      time: '21:00',
      location: t('mockData.events.event1.location'),
      city: 'Paris',
      address: '3 Avenue du Général Eisenhower, 75008 Paris',
      price: { from: 35, currency: '€' },
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070',
      featured: true,
      tags: ['concert', 'albanais', 'live'],
      capacity: 2000,
      availableTickets: 150,
      whatsappLink: 'https://wa.me/33123456789?text=Bonjour,%20je%20souhaite%20réserver%20pour%20Nata%20Shqiptare%202024'
    },
    {
      id: '2',
      title: t('mockData.events.event2.title'),
      description: t('mockData.events.event2.description'),
      category: 'festival' as const,
      date: '2024-12-22',
      time: '15:00',
      location: t('mockData.events.event2.location'),
      city: 'Bruxelles',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070',
      featured: false,
      tags: ['festival', 'culture', 'gratuit'],
      whatsappLink: 'https://wa.me/33123456789?text=Bonjour,%20je%20souhaite%20des%20informations%20sur%20le%20Festival%20Folklorique'
    },
    {
      id: '3',
      title: t('mockData.events.event3.title'),
      description: t('mockData.events.event3.description'),
      category: 'party' as const,
      date: '2024-12-31',
      time: '22:00',
      location: t('mockData.events.event3.location'),
      city: 'Genève',
      price: { from: 120, currency: '€' },
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2070',
      featured: true,
      tags: ['réveillon', 'vip', 'gala'],
      whatsappLink: 'https://wa.me/33123456789?text=Bonjour,%20je%20souhaite%20réserver%20pour%20le%20Nouvel%20An%202025'
    }
  ]
}

export function getMockArtists(): Artist[] {
  return [
    {
      id: '1',
      name: 'DJ Ardit',
      role: t('mockData.djs.dj1.role'),
      description: t('mockData.djs.dj1.description'),
      image_url: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=2070',
      events_count: 200,
      instagram: 'https://instagram.com/djardit',
      badge: 'star' as const
    },
    {
      id: '2',
      name: 'DJ Lori',
      role: t('mockData.djs.dj2.role'),
      description: t('mockData.djs.dj2.description'),
      image_url: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?q=80&w=2076',
      events_count: 150,
      instagram: 'https://instagram.com/djlori',
      badge: 'fire' as const
    },
    {
      id: '3',
      name: 'DJ Enca',
      role: t('mockData.djs.dj3.role'),
      description: t('mockData.djs.dj3.description'),
      image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070',
      events_count: 100,
      instagram: 'https://instagram.com/djenca',
      badge: 'premium' as const
    }
  ]
}

/**
 * @deprecated Utilisez getMockArtists() à la place
 */
export const getMockDJs = getMockArtists

export function getMockGallery(): GalleryItem[] {
  return [
    {
      id: '1',
      title: 'Concert Albanais 2024',
      category: 'Concert Live',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070',
      type: 'concert' as const,
      date: '2024-10-15'
    },
    {
      id: '2',
      title: 'Festival Culturel',
      category: 'Événement',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070',
      type: 'festival' as const,
      date: '2024-09-20'
    },
    {
      id: '3',
      title: 'Mariage Premium',
      category: 'Cérémonie',
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069',
      type: 'wedding' as const,
      date: '2024-08-12'
    }
  ]
}

