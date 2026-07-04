// Swagger UI stranica - dostupna na /swagger
// Ucitava Swagger CSS i JS sa CDN-a (ne treba instalacija), pa ucitava spec sa /api/docs
export default function SwaggerPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css"
      />
      <div id="swagger-ui" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Cekamo da se stranica ucita, pa inicijalizujemo Swagger UI
            window.onload = function() {
              const script = document.createElement('script');
              script.src = 'https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js';
              script.onload = function() {
                SwaggerUIBundle({
                  url: '/api/docs',          // ucitava nas OpenAPI JSON spec
                  dom_id: '#swagger-ui',     // ubacuje UI u ovaj div
                  presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                  ],
                  layout: 'BaseLayout',
                  deepLinking: true,
                  withCredentials: true,     // salju se cookies uz zahteve (bitno za auth rute)
                });
              };
              document.head.appendChild(script);
            };
          `,
        }}
      />
    </>
  );
}
