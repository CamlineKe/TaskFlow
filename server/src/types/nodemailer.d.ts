declare module 'nodemailer' {
  export function createTestAccount(): Promise<{
    user: string;
    pass: string;
  }>;
  
  export function createTransport(options: any): any;
  
  export function getTestMessageUrl(info: any): string;
  
  // Add more type definitions as needed
}