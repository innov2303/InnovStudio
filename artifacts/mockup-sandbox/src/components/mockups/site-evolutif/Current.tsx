import pageSnapshot from "./current.html?raw";

const styles = pageSnapshot.match(/<style>([\s\S]*?)<\/style>/i)?.[1] ?? "";
const body = pageSnapshot.match(/<body>([\s\S]*?)<\/body>/i)?.[1] ?? "";
const fontStylesheet =
  pageSnapshot.match(/<link href="(https:\/\/fonts\.googleapis\.com\/[^"]+)" rel="stylesheet">/i)?.[1] ?? "";

export function Current() {
  return (
    <>
      {fontStylesheet && <link rel="stylesheet" href={fontStylesheet} />}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
