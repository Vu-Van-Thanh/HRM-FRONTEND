export interface Email {
    id: string;
    text?: string;
    title: string;
    subject: string;
    date: string;
    unread?: boolean;
    isIcon?: boolean;
    category?: string;
    isStarred?: boolean;
}
