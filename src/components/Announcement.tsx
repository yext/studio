// import Announcement, { BannerProps as AnnouncementProps } from "./Banner"

export interface AnnouncementProps {
  title?: string
}

export const globalProps: AnnouncementProps = {
  title: 'global title'
}

// export default Announcement;
export default function Announcement({ title }: AnnouncementProps) {
  return <div>Announcement: {title}</div>
}
