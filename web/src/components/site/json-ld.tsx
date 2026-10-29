/** 結構化資料（JSON-LD）。把 < 換成 <，避免資料裡的字串提早結束 script 標籤 */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
