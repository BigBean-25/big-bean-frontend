import { NextRequest, NextResponse } from 'next/server'

const GONE_PATHS = new Set([
  '/events/live-music-jamming-night-s-kammanahalli',
  '/events/coffee-canvas-night',
  '/coffee-shop-hyderabad',
  '/coffee-shop-delhi',
  '/coffee-shop-kolkata',
])

function redirect301(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ''
  url.hash = ''
  return NextResponse.redirect(url, 301)
}

function gone() {
  return new NextResponse('Gone', { status: 410 })
}

function notFound() {
  return new NextResponse('Not Found', { status: 404 })
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (pathname === '/index.php') {
    return redirect301(request, '/')
  }

  if (pathname === '/events.php') {
    return redirect301(request, '/events')
  }

  if (pathname === '/outlets.php') {
    return redirect301(request, '/outlets')
  }

  if (pathname === '/menu.php') {
    return redirect301(request, '/menu')
  }

  if (pathname === '/contact.php') {
    return redirect301(request, '/contact')
  }

  if (pathname === '/reservations.php') {
    return redirect301(request, '/reservations')
  }

  if (pathname === '/privacy.php') {
    return redirect301(request, '/privacy-policy')
  }

  if (pathname === '/terms.php') {
    return redirect301(request, '/terms-and-conditions')
  }

  if (pathname === '/cart.php') {
    return redirect301(request, '/cart')
  }

  if (pathname === '/shop.php' || pathname === '/merchandise.php' || pathname === '/merchandise-products.php') {
    return redirect301(request, '/merchandise')
  }

  if (pathname === '/best-coffee-shop-bangalore.php' || pathname === '/coffee-shop-bangalore') {
    return redirect301(request, '/outlets')
  }

  if (pathname === '/best-coffee-shop-koramangala.php') {
    return redirect301(request, '/outlets/koramangala')
  }

  if (pathname === '/best-coffee-shop-hsr-layout.php') {
    return redirect301(request, '/outlets/hsr-layout')
  }

  if (pathname === '/best-coffee-shop-indiranagar.php') {
    return redirect301(request, '/outlets/indiranagar')
  }

  if (pathname === '/best-coffee-shop-electronic-city.php') {
    return redirect301(request, '/outlets/electronic-city')
  }

  if (pathname === '/best-coffee-shop-rajarajeshwari-nagar.php') {
    return redirect301(request, '/outlets/rajarajeshwari-nagar')
  }

  if (pathname === '/outlet-detail.php') {
    const id = searchParams.get('id')?.trim() || ''
    const location = searchParams.get('location')?.toLowerCase().trim() || ''
    if (id === '4' && location === 'rajarajeshwari-nagar') {
      return redirect301(request, '/outlets/rajarajeshwari-nagar')
    }

    return notFound()
  }

  if (pathname === '/cafe-locations.php' && searchParams.get('city') === 'Delhi') {
    return gone()
  }

  if (pathname.startsWith('/location/')) {
    return notFound()
  }

  if (pathname === '/events/live-music-jamming-night-s-kammanahalli' || pathname === '/events/coffee-canvas-night') {
    return gone()
  }

  if (pathname === '/coffee-shop-hyderabad' || pathname === '/coffee-shop-delhi' || pathname === '/coffee-shop-kolkata') {
    return gone()
  }

  if (pathname === '/product.php') {
    const productId = searchParams.get('id')?.trim() || ''
    if (productId) {
      return notFound()
    }
  }

  if (pathname === '/product/X18') {
    return notFound()
  }

  if (GONE_PATHS.has(pathname)) {
    return gone()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/index.php',
    '/events.php',
    '/outlets.php',
    '/menu.php',
    '/contact.php',
    '/reservations.php',
    '/privacy.php',
    '/terms.php',
    '/cart.php',
    '/shop.php',
    '/merchandise.php',
    '/merchandise-products.php',
    '/best-coffee-shop-bangalore.php',
    '/coffee-shop-bangalore',
    '/best-coffee-shop-koramangala.php',
    '/best-coffee-shop-hsr-layout.php',
    '/best-coffee-shop-indiranagar.php',
    '/best-coffee-shop-electronic-city.php',
    '/best-coffee-shop-rajarajeshwari-nagar.php',
    '/outlet-detail.php',
    '/cafe-locations.php',
    '/product.php',
    '/product/X18',
    '/location/:path*',
    '/events/live-music-jamming-night-s-kammanahalli',
    '/events/coffee-canvas-night',
    '/coffee-shop-hyderabad',
    '/coffee-shop-delhi',
    '/coffee-shop-kolkata',
  ],
}
