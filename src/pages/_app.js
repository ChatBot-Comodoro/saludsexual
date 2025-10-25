import { MantineProvider, AppShell, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { SessionProvider } from 'next-auth/react';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ErrorProvider } from '@/contexts/ErrorContext';
import VisitTracker from '@/components/VisitTracker';

import Head from 'next/head';
import '@mantine/core/styles.css';
import '@/styles/globals.css';
import '@mantine/notifications/styles.css';
import '@/styles/tiptap-editor.css';

const theme = createTheme({
  fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  headings: {
    fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontWeight: '800',  // Extra Bold para todos los headings
  },
  colors: {
    brand: [
      '#f0f4f8',  // 50 - muy claro
      '#d9e2ec',  // 100 - claro
      '#bcccdc',  // 200 - claro medio
      '#9fb3c8',  // 300 - medio claro
      '#829ab1',  // 400 - medio
      '#1B436B',  // 500 - COLOR PRINCIPAL
      '#16395c',  // 600 - oscuro medio
      '#122f4d',  // 700 - oscuro
      '#0e253e',  // 800 - muy oscuro
      '#0a1b2f',  // 900 - extra oscuro
    ],
  },
  primaryColor: 'brand',
  primaryShade: 5,
  defaultRadius: 'md',
  components: {
    Title: {
      styles: {
        root: {
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 800,  // Extra Bold para componentes Title
        },
      },
    },
    Button: {
      styles: {
        root: {
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 600,  // SemiBold para botones (más legible)
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          fontFamily: 'Montserrat, sans-serif',
        },
      },
    },
    Text: {
      styles: {
        root: {
          fontFamily: 'Montserrat, sans-serif',
        },
      },
    },
    Anchor: {
      styles: {
        root: {
          fontFamily: 'Montserrat, sans-serif',
        },
      },
    },
    Paper: {
      styles: {
        root: {
          fontFamily: 'Montserrat, sans-serif',
        },
      },
    },
    Card: {
      styles: {
        root: {
          fontFamily: 'Montserrat, sans-serif',
        },
      },
    },
  },
});


export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <SessionProvider session={session}>
        <MantineProvider theme={theme}>
        <ModalsProvider>
          <ErrorProvider>
            <Notifications position="top-center" zIndex={2000} />
            <Head>
              <meta name="description" content="Tu asistente de salud personal" />
              <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
              {/* Meta tags específicos para iOS */}
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-status-bar-style" content="default" />
              <meta name="format-detection" content="telephone=no" />
            </Head>
            
            <ErrorBoundary>
              {/* Visit Tracker - Automatic page visit tracking */}
              <VisitTracker />
              
              <AppShell
                header={{ height: 70 }}
                padding="0"
              >
                <Navbar />
                <AppShell.Main
                  style={{
                    paddingTop: '60px',
                    minHeight: 'calc(100vh - 60px)'
                  }}
                >
                  <Component {...pageProps} />
                  <Footer />
                </AppShell.Main>
                
                {/* Floating Chat - Available on all pages */}
                <FloatingChat />
              </AppShell>
            </ErrorBoundary>
          </ErrorProvider>
        </ModalsProvider>
      </MantineProvider>
      </SessionProvider>
    </>
  )
}
