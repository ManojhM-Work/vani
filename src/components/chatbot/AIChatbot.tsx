
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m VANI\'s AI assistant. I can help you with API conversions, testing questions, and guide you through our tools. How can I assist you today?',
      type: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // API Conversion related responses
    if (lowerMessage.includes('convert') || lowerMessage.includes('conversion')) {
      if (lowerMessage.includes('postman')) {
        return 'I can help you convert Postman collections! You can convert them to Swagger, JMX, Playwright, and other formats. Visit the Conversion page and select "Postman" as your source format.';
      }
      if (lowerMessage.includes('swagger')) {
        return 'Swagger/OpenAPI conversions are supported! You can convert Swagger files to Postman collections, JMX test plans, or Playwright scripts. Use our Conversion tool to get started.';
      }
      return 'VANI supports multiple API format conversions including Postman ↔ Swagger, JMX, Playwright, and more. What specific conversion are you looking for?';
    }
    
    // Testing related responses
    if (lowerMessage.includes('test') || lowerMessage.includes('testing')) {
      if (lowerMessage.includes('functional')) {
        return 'For functional testing, use our Functional Testing page where you can build and run API tests with a Postman-like interface. You can create requests, set headers, and validate responses.';
      }
      if (lowerMessage.includes('performance')) {
        return 'Our Performance Testing tool lets you run JMeter-like load tests with real-time monitoring. You can configure virtual users, ramp-up times, and view performance metrics.';
      }
      if (lowerMessage.includes('automation')) {
        return 'Automation testing with Playwright is available! Create and manage automated test suites for your APIs and web applications.';
      }
      return 'VANI offers three types of testing: Functional (API testing), Automation (Playwright scripts), and Performance (load testing). Which one interests you?';
    }
    
    // TTR related responses
    if (lowerMessage.includes('ttr') || lowerMessage.includes('tool recognition')) {
      return 'TTR (Tool-to-Tool Recognition) helps identify API tool conventions automatically. Upload sample files and let AI analyze the format to suggest the best conversion path.';
    }
    
    // General help responses
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return 'I can help you with:\n• API format conversions (Postman, Swagger, JMX, Playwright)\n• Functional API testing\n• Performance testing setup\n• Automation testing with Playwright\n• TTR tool recognition\n\nWhat would you like to know more about?';
    }
    
    // Getting started responses
    if (lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      return 'Great! Here\'s how to get started:\n1. Visit the Dashboard to see all available tools\n2. For conversions, go to the Conversion page\n3. For testing, choose from Functional, Automation, or Performance testing\n4. Use TTR if you need help identifying your API format\n\nWhat would you like to try first?';
    }
    
    // Default responses
    const defaultResponses = [
      'I\'m here to help with VANI\'s API tools! Could you be more specific about what you need assistance with?',
      'That\'s an interesting question! For detailed technical support, you might want to explore our conversion and testing tools. What specific task are you trying to accomplish?',
      'I can assist with API conversions, testing, and tool guidance. What would you like to know more about?'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(inputValue),
        type: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
        )}
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-40 w-96 h-[500px] shadow-2xl border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              VANI AI Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-[420px]">
            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.type === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.type === 'bot' && (
                      <div className="flex-shrink-0">
                        <Bot className="h-6 w-6 text-primary mt-1" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[280px] rounded-lg px-3 py-2 text-sm whitespace-pre-line",
                        message.type === 'user'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.content}
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="flex-shrink-0">
                        <User className="h-6 w-6 text-muted-foreground mt-1" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <Bot className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about API conversions or testing..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AIChatbot;
