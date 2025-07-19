import { Archive, FileText, Mail, Send, Star, Trash2 } from 'lucide-react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Email, EmailFolder } from '../types/app';

import mockData from '../mock-data';
import { generateId, getCurrentIsoDate } from './utils';

interface EmailsState {
  emails: Email[];
  folders: EmailFolder[];
  selectedFolder: string;
  isLoading: boolean;
  error: string | null;

  // Email Actions
  addEmail: (emailData: Omit<Email, 'id' | 'timestamp'>) => Email;
  getEmailById: (id: string) => Email | undefined;
  updateEmail: (
    emailId: string,
    updates: Partial<Omit<Email, 'id' | 'timestamp'>>
  ) => void;
  deleteEmail: (emailId: string) => void;

  // Email Status Actions
  markAsRead: (emailId: string) => void;
  markAsUnread: (emailId: string) => void;
  toggleStar: (emailId: string) => void;
  archiveEmail: (emailId: string) => void;
  unarchiveEmail: (emailId: string) => void;
  moveToTrash: (emailId: string) => void;
  restoreFromTrash: (emailId: string) => void;
  permanentlyDelete: (emailId: string) => void;

  // Folder Actions
  setSelectedFolder: (folder: string) => void;

  // Gmail API Actions
  refreshEmails: () => Promise<void>;
  sendEmail: (emailData: any) => Promise<Email>;
  syncWithGmail: () => Promise<void>;

  // Utility Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultFolders: EmailFolder[] = [
  { id: 'inbox', name: 'Inbox', icon: Mail, count: 0 },
  { id: 'starred', name: 'Starred', icon: Star, count: 0 },
  { id: 'sent', name: 'Sent', icon: Send, count: 0 },
  { id: 'drafts', name: 'Drafts', icon: FileText, count: 0 },
  { id: 'archive', name: 'Archive', icon: Archive, count: 0 },
  { id: 'trash', name: 'Trash', icon: Trash2, count: 0 },
];

export const useEmailStore = create<EmailsState>()(
  devtools(
    immer((set, get) => ({
      emails: [...mockData.inboxEmails, ...mockData.sentEmails],
      folders: defaultFolders,
      selectedFolder: 'inbox',
      isLoading: false,
      error: null,

      // Email Actions

      addEmail: emailData => {
        const newEmail: Email = {
          ...emailData,
          id: generateId(),
          timestamp: getCurrentIsoDate(),
        };
        set(state => {
          state.emails.unshift(newEmail); // Add to beginning for chronological order
        });
        return newEmail;
      },

      getEmailById: id => {
        return get().emails.find(email => email.id === id);
      },

      updateEmail: (emailId, updates) => {
        set(state => {
          const email = state.emails.find(e => e.id === emailId);
          if (email) {
            Object.assign(email, updates);
          }
        });
      },

      deleteEmail: emailId => {
        set(state => {
          state.emails = state.emails.filter(email => email.id !== emailId);
        });
      },

      // Email Status Actions

      markAsRead: emailId => {
        set(state => {
          const email = state.emails.find(e => e.id === emailId);
          if (email) {
            email.isRead = true;
          }
        });
      },

      markAsUnread: emailId => {
        set(state => {
          const email = state.emails.find(e => e.id === emailId);
          if (email) {
            email.isRead = false;
          }
        });
      },

      toggleStar: emailId => {
        set(state => {
          const email = state.emails.find(e => e.id === emailId);
          if (email) {
            email.isStarred = !email.isStarred;
          }
        });
      },

      archiveEmail: emailId => {
        set(state => {
          const email = state.emails.find(e => e.id === emailId);
          if (email) {
            email.isArchived = true;
          }
        });
      },

      unarchiveEmail: emailId => {
        set(state => {
          const email = state.emails.find(e => e.id === emailId);
          if (email) {
            email.isArchived = false;
          }
        });
      },

      moveToTrash: emailId => {
        set(state => {
          const email = state.emails.find(e => e.id === emailId);
          if (email) {
            email.isDeleted = true;
          }
        });
      },

      restoreFromTrash: emailId => {
        set(state => {
          const email = state.emails.find(e => e.id === emailId);
          if (email) {
            email.isDeleted = false;
          }
        });
      },

      permanentlyDelete: emailId => {
        get().deleteEmail(emailId);
      },

      // Folder Actions

      setSelectedFolder: folder => {
        set(state => {
          state.selectedFolder = folder;
        });
      },

      // Gmail API Actions

      refreshEmails: async () => {
        set(state => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Here you would call the Gmail API
          // const emails = await gmailAPI.getEmails();
          // set((state) => {
          //   state.emails = emails.map(email => ({
          //     ...email,
          //     id: email.id ?? generateId(),
          //     timestamp: email.timestamp ?? getCurrentIsoDate(),
          //   }));
          // });

          // For now, just simulate a refresh
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch {
          set(state => {
            state.error = 'Failed to refresh emails';
          });
        } finally {
          set(state => {
            state.isLoading = false;
          });
        }
      },

      sendEmail: async emailData => {
        set(state => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Here you would call the Gmail API to send email
          // const sentEmail = await gmailAPI.sendEmail(emailData);

          // Create sent email record
          const sentEmail: Email = {
            subject: emailData.subject,
            content: emailData.content,
            sender: { name: 'You', email: 'you@company.com' }, // This would come from user profile
            recipients: Array.isArray(emailData.to)
              ? emailData.to
              : [emailData.to],
            cc: emailData.cc
              ? Array.isArray(emailData.cc)
                ? emailData.cc
                : [emailData.cc]
              : [],
            bcc: emailData.bcc
              ? Array.isArray(emailData.bcc)
                ? emailData.bcc
                : [emailData.bcc]
              : [],
            isRead: true,
            isStarred: false,
            isArchived: false,
            isDeleted: false,
            isSent: true,
            isDraft: false,
            hasAttachments: emailData.attachments
              ? emailData.attachments.length > 0
              : false,
            attachments: emailData.attachments || [],
            preview:
              emailData.content.substring(0, 100) +
              (emailData.content.length > 100 ? '...' : ''),
            threadId: emailData.threadId || generateId(),
            labels: emailData.labels || [],
            id: generateId(),
            timestamp: getCurrentIsoDate(),
          };

          set(state => {
            state.emails.unshift(sentEmail);
          });

          return sentEmail;
        } catch (error) {
          set(state => {
            state.error = 'Failed to send email';
          });
          throw error;
        } finally {
          set(state => {
            state.isLoading = false;
          });
        }
      },

      syncWithGmail: async () => {
        set(state => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Here you would implement Gmail API integration
          // const gmailEmails = await gmailAPI.listMessages();
          // const formattedEmails = gmailEmails.map(formatGmailMessage);
          // set((state) => {
          //   state.emails = formattedEmails.map(email => ({
          //     ...email,
          //     id: email.id ?? generateId(),
          //     timestamp: email.timestamp ?? getCurrentIsoDate(),
          //   }));
          // });

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch {
          set(state => {
            state.error = 'Failed to sync with Gmail';
          });
        } finally {
          set(state => {
            state.isLoading = false;
          });
        }
      },

      // Utility Actions

      setLoading: loading => {
        set(state => {
          state.isLoading = loading;
        });
      },

      setError: error => {
        set(state => {
          state.error = error;
        });
      },
    })),
    { name: 'EmailStore' }
  )
);
