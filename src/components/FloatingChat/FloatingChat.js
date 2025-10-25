import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  ActionIcon,
  Stack,
  Text,
  Button,
  ScrollArea,
  Avatar,
  Group,
  Paper,
  Textarea,
  Tooltip,
  Loader,
  Image
} from '@mantine/core';
import {
  IconMessageCircle,
  IconSend,
  IconX,
  IconRobot,
  IconUser,
  IconTrash
} from '@tabler/icons-react';
import classes from './FloatingChat.module.css';

// Función para sanitizar HTML básico
const sanitizeHTML = (html) => {
  // Si no contiene etiquetas HTML, convertir saltos de línea a <br>
  if (!/<[^>]+>/.test(html)) {
    return html.replace(/\n/g, '<br>');
  }
  
  // Permitir solo etiquetas seguras y básicas
  const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'br', 'ul', 'ol', 'li', 'div', 'span', 'a'];
  const tagRegex = /<\/?([a-zA-Z]+)(?:\s[^>]*)?>|<br\s*\/?>/gi;
  
  // Reemplazar saltos de línea fuera de etiquetas con <br>
  let sanitized = html.replace(/\n/g, '<br>');
  
  // Filtrar etiquetas permitidas
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    if (!tagName) return match; // Para <br /> tags
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return ''; // Remover etiquetas no permitidas
  });
  
  return sanitized;
};

const FloatingChat = () => {
  const [opened, setOpened] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [lastBotMessageId, setLastBotMessageId] = useState(null);

  // Referencia para el scroll del chat
  const scrollAreaRef = useRef(null);

  // Funciones eliminadas - ya no usamos localStorage

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Siempre iniciar con mensaje de bienvenida - sin cargar del localStorage
    const initialMessage = {
      id: Date.now(),
      sender: "bot",
      text:  "¡Hola, soy Mara! La asistente virtual de Salud de Comodoro Rivadavia.\n\nPuedo responder tus dudas sobre VIH e Infecciones de Transmisión Sexual.\n\nNuestra conversación es anónima, confidencial y se eliminará cuando cierres esta página. Al chatear estás aceptando las <a href='/politicas-privacidad' target='_blank' style='color: #FF0048; text-decoration: underline;'>Políticas de Privacidad</a>.\n\n¿En qué puedo ayudarte?",
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    setLastBotMessageId(initialMessage.id);

    // Listener para abrir el chat externamente
    const handleOpenChat = (event) => {
      setOpened(true);
      
      // Verificar si hay un mensaje del bot guardado en sessionStorage
      const botMessage = sessionStorage.getItem('chatBotMessage');
      const topic = sessionStorage.getItem('chatTopic');
      
      if (botMessage && topic) {
        // Crear el mensaje del bot automático
        const autoMessage = {
          id: Date.now() + Math.random(),
          sender: "bot",
          text: botMessage,
          timestamp: new Date(),
          isAutomatic: true
        };
        
        // Agregar el mensaje automático después de un pequeño delay
        setTimeout(() => {
          setMessages(prev => [...prev, autoMessage]);
          // Forzar scroll al final después de agregar el mensaje automático
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }, 300);

        // Enviar el contexto del tema al asistente para que entienda el contexto
        setTimeout(async () => {
          try {
            const contextMessage = `El usuario está interesado en el tema: ${topic}. Por favor, proporciona información relevante sobre este tema.`;
            const apiResponse = await sendMessageToAPI(contextMessage, threadId);
            
            // Guardar el threadId si es nuevo
            if (apiResponse.threadId && apiResponse.threadId !== threadId) {
              setThreadId(apiResponse.threadId);
            }

            // Agregar la respuesta del asistente
            const assistantMessage = {
              id: Date.now() + Math.random() + 1,
              sender: "bot",
              text: apiResponse.response,
              timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
          } catch (error) {
            console.error('Error enviando contexto del tema:', error);
          }
        }, 500);
        
        // Limpiar el sessionStorage después de usar
        sessionStorage.removeItem('chatBotMessage');
        sessionStorage.removeItem('chatTopic');
      }
    };

    window.addEventListener('openFloatingChat', handleOpenChat);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('openFloatingChat', handleOpenChat);
    };
  }, []);

  // useEffect eliminado - ya no guardamos mensajes en localStorage

  // Función para hacer scroll al final del chat
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') ||
                      scrollAreaRef.current.querySelector('.mantine-ScrollArea-viewport') ||
                      scrollAreaRef.current.querySelector('[data-mantine-scroll-area-viewport]');
      
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 50);
      }
    }
  };

  // Función para hacer scroll al inicio de la última respuesta del bot
  const scrollToBotResponse = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') ||
                      scrollAreaRef.current.querySelector('.mantine-ScrollArea-viewport') ||
                      scrollAreaRef.current.querySelector('[data-mantine-scroll-area-viewport]');
      
      if (viewport) {
        setTimeout(() => {
          // Buscar todos los mensajes
          const messageElements = viewport.querySelectorAll('[data-message-id]');
          if (messageElements.length > 0) {
            // Encontrar el último mensaje del bot
            let lastBotMessage = null;
            for (let i = messageElements.length - 1; i >= 0; i--) {
              const element = messageElements[i];
              if (element.getAttribute('data-is-bot') === 'true') {
                lastBotMessage = element;
                break;
              }
            }
            
            if (lastBotMessage) {
              // Hacer scroll al inicio del mensaje del bot
              const offsetTop = lastBotMessage.offsetTop - 20; // 20px de padding superior
              viewport.scrollTop = offsetTop;
            } else {
              // Si no encuentra mensaje del bot, scroll al final
              viewport.scrollTop = viewport.scrollHeight;
            }
          }
        }, 100);
      }
    }
  };

  // Efecto para hacer scroll al final cuando cambian los mensajes
  useEffect(() => {
    if (opened && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.sender === 'bot' && lastMessage.id !== lastBotMessageId) {
        // Es una nueva respuesta del bot - scroll al inicio de la respuesta
        setLastBotMessageId(lastMessage.id);
        
        // Si es un mensaje automático, hacer scroll al final en lugar del inicio
        if (lastMessage.isAutomatic) {
          const timers = [
            setTimeout(scrollToBottom, 100),
            setTimeout(scrollToBottom, 300),
            setTimeout(scrollToBottom, 500)
          ];
          return () => timers.forEach(timer => clearTimeout(timer));
        } else {
          const timers = [
            setTimeout(scrollToBotResponse, 100),
            setTimeout(scrollToBotResponse, 300),
            setTimeout(scrollToBotResponse, 500)
          ];
          return () => timers.forEach(timer => clearTimeout(timer));
        }
      } else if (lastMessage.sender === 'user') {
        // Es un mensaje del usuario - scroll al final
        const timers = [
          setTimeout(scrollToBottom, 50),
          setTimeout(scrollToBottom, 150)
        ];
        return () => timers.forEach(timer => clearTimeout(timer));
      }
    }
  }, [messages, opened, lastBotMessageId]);

  // Efecto para hacer scroll al final cuando se abre el chat
  useEffect(() => {
    if (opened) {
      // Múltiples intentos para asegurar que el scroll funcione
      const timers = [
        setTimeout(scrollToBottom, 100),
        setTimeout(scrollToBottom, 300),
        setTimeout(scrollToBottom, 500)
      ];
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [opened]);

  const sendMessageToAPI = async (message, currentThreadId) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          threadId: currentThreadId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: userMessageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Call API
      const apiResponse = await sendMessageToAPI(userMessageText, threadId);
      
      // Guardar el threadId solo en memoria (no en localStorage)
      if (apiResponse.threadId && apiResponse.threadId !== threadId) {
        setThreadId(apiResponse.threadId);
      }

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: apiResponse.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Lo siento, hubo un error al procesar tu consulta. Por favor, intenta nuevamente.",
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !isLoading) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Funciones de localStorage eliminadas - cada sesión es nueva

  return (
    <>
      {/* Floating Button */}
      <Tooltip label="Chat Salud Comodoro" position="left">
        <ActionIcon
          size={isMobile ? 60 : 70}
          radius="50%"
          className={classes.floatingButton}
          onClick={() => setOpened(!opened)}
          color="#FF0048"
          variant="filled"
          style={{
            position: 'fixed',
            bottom: isMobile ? '15px' : '20px',
            right: isMobile ? '15px' : '20px',
            zIndex: 1001,
            backgroundColor: '#FF0048',
            boxShadow: '0 4px 20px rgba(255, 0, 72, 0.4)',
            border: '3px solid white',
            padding: '8px'
          }}
        >
          <Image
            src="/mara.png"
            alt="Chat Mara"
            width={isMobile ? 44 : 54}
            height={isMobile ? 44 : 54}
            fit="contain"
          />
        </ActionIcon>
      </Tooltip>

      {/* Chat Widget */}
      {opened && (
        <Box
          className={classes.chatWidget}
          style={{
            position: 'fixed',
            bottom: isMobile ? '90px' : '105px',
            right: isMobile ? '15px' : '20px',
            width: isMobile ? 'calc(100vw - 30px)' : '350px',
            maxWidth: isMobile ? '320px' : '350px',
            height: isMobile ? 'calc(100vh - 180px)' : '550px',
            maxHeight: isMobile ? '650px' : '550px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: '1px solid #e9ecef',
            zIndex: 1002,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <Group justify="space-between" p="md" style={{ 
            borderBottom: '1px solid #FFF2F6',
            background: 'linear-gradient(135deg, #FF0048 0%, #FF1E5E 100%)',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px'
          }}>
            <Group>
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                <Image
                  src="/mara.png"
                  alt="Logo Salud Comodoro"
                  width={44}
                  height={44}
                  fit="contain"
                />
              </Box>
              <Box>
                <Text size="sm" fw={600} c="white">Mara</Text>
                <Text size="xs" c="rgba(255,255,255,0.8)">
                  {isLoading ? 'Escribiendo...' : 'Chatbot de salud'}
                </Text>
              </Box>
            </Group>
            <Group gap="xs">
             
              <ActionIcon 
                variant="subtle" 
                color="white" 
                onClick={() => setOpened(false)}
                size="sm"
                style={{ color: 'white' }}
              >
                <IconX size={16} />
              </ActionIcon>
            </Group>
          </Group>
          {/* Content */}
          <Stack gap={isMobile ? "xs" : "xs"} style={{ flex: 1,  overflow: 'hidden' }} p={0}>
            {/* Messages Area */}
            <ScrollArea
              ref={scrollAreaRef}
              h={isMobile ? 'calc(100vh - 320px)' : 320}
              type="scroll"
              scrollbars="y"
              styles={{
                root: { 
                  height: isMobile ? 'calc(100vh - 320px)' : '320px',
                  maxHeight: isMobile ? '450px' : '320px',
                  minHeight: isMobile ? '280px' : '320px',
                  margin: isMobile ? '8px' : '12px 16px 8px 16px'
                },
                viewport: { paddingBottom: '0 !important' }
              }}
            >
              <Stack gap="sm" mt={isMobile ? 5 : 5}>
                {messages.map((message) => (
                  <Group
                    key={message.id}
                    align="flex-start"
                    gap="sm"
                    justify={message.sender === 'bot' ? 'flex-start' : 'flex-end'}
                    data-message-id={message.id}
                    data-is-bot={message.sender === 'bot'}
                  >
                    {message.sender === 'bot' && (
                      <Box
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                          minWidth: 32
                        }}
                      >
                        <Image
                          src="/mara-entera.png"
                          alt="Logo Salud Comodoro"
                          width={120}
                          height={120}
                          fit="contain"
                        />
                      </Box>
                    )}
                    
                    <Paper
                      p="sm"
                      radius="lg"
                      bg={message.sender === 'bot' ? (message.isError ? 'red.0' : 'white') : '#FF0048'}
                      c={message.sender === 'bot' ? (message.isError ? 'red.8' : 'black') : 'white'}
                      maw="80%"
                      style={{
                        border: message.sender === 'bot' ? '1px solid #e9ecef' : 'none'
                      }}
                    >
                      {message.sender === 'bot' ? (
                        <div 
                          className={classes.botMessageContent}
                          style={{ 
                            fontSize: '14px', 
                            lineHeight: '1.4',
                            color: message.isError ? '#d63384' : 'black'
                          }}
                          dangerouslySetInnerHTML={{ __html: sanitizeHTML(message.text) }}
                        />
                      ) : (
                        <Text size="sm" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                          {message.text}
                        </Text>
                      )}
                    </Paper>
                  </Group>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <Group align="flex-start" gap="sm" justify="flex-start">
                    <Box
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        minWidth: 32
                      }}
                    >
                      <Image
                        src="/mara-entera.png"
                        alt="Logo Salud Comodoro"
                        width={120}
                        height={120}
                        fit="contain"
                      />
                    </Box>
                    <Paper p="sm" radius="lg" bg="white" style={{ border: '1px solid #e9ecef' }}>
                      <Group gap="xs">
                        <Loader size="xs" color="#FF0048" />
                        <Text size="sm" c="black">
                          Escribiendo...
                        </Text>
                      </Group>
                    </Paper>
                  </Group>
                )}
              </Stack>
            </ScrollArea>

            {/* Input Area */}
            <Group gap="xs" px={isMobile ? "xs" : "md"} py={isMobile ? "xs" : "sm"}>
              <Textarea
                placeholder={isLoading ? "Esperando respuesta..." : "Escribe tu consulta de salud..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                autosize
                minRows={1}
                maxRows={3}
                style={{ flex: 1 }}
                radius="lg"
                disabled={isLoading}
              />
              <ActionIcon
                size="lg"
                radius="lg"
                style={{ backgroundColor: '#FF0048', color: 'white' }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                loading={isLoading}
              >
                <IconSend size={16} />
              </ActionIcon>
            </Group>

            {/* Status and Disclaimer */}
            <Stack gap={0} px={isMobile ? "xs" : "md"} pb={isMobile ? "xs" : "sm"}>
              <Text size="xs" c="dimmed" ta="center">
                Esta herramienta es informativa y no reemplaza la consulta médica profesional.
              </Text>
            </Stack>
          </Stack>
        </Box>
      )}
    </>
  );
};

export default FloatingChat;
