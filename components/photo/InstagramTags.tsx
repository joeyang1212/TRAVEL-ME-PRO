type InstagramTagsProps = {
  hashtags: string[];
};

function instagramTagUrl(tag: string) {
  return `https://www.instagram.com/explore/tags/${encodeURIComponent(tag.replace(/^#/, ""))}/`;
}

export function InstagramTags({ hashtags }: InstagramTagsProps) {
  return (
    <div className="igSearchBlock">
      <b>Instagram 靈感搜尋</b>
      <div>
        {hashtags.map((tag) => (
          <a href={instagramTagUrl(tag)} target="_blank" rel="noreferrer" key={tag}>
            #{tag.replace(/^#/, "")}
          </a>
        ))}
      </div>
      <small>只開啟 Instagram 標籤頁，不下載或嵌入第三方照片。</small>
    </div>
  );
}
