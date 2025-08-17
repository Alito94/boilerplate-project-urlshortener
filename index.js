require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// --- AÑADIDO: Módulos para validar y analizar URLs ---
const dns = require('dns');
const urlparser = require('url');

// Tu array para simular la base de datos
const originalUrls = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// --- AÑADIDO: Lógica del Acortador de URLs ---

// 1. Ruta para crear una URL corta (recibe datos del formulario)
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Extraemos el nombre de dominio de la URL para verificarlo
  const hostname = urlparser.parse(originalUrl).hostname;
  
  // dns.lookup comprueba si el dominio es real y tiene una dirección IP.
  dns.lookup(hostname, (err, address) => {
    // Si hay un error (ej: el dominio no existe) o no hay dirección, la URL es inválida
    if (err || !address) {
      return res.json({ error: 'invalid url' });
    }

    // Si la URL es válida, la agregamos a nuestro array
    originalUrls.push(originalUrl);
    // La URL corta será simplemente el número de su posición (empezando en 1)
    const shortUrl = originalUrls.length;

    // Devolvemos el objeto JSON requerido
    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});

// 2. Ruta para visitar una URL corta y ser redirigido
app.get('/api/shorturl/:short_url', function(req, res) {
  // Obtenemos el número de la URL corta desde el parámetro de la ruta
  const shortUrl = parseInt(req.params.short_url);
  
  // Buscamos la URL original en nuestro array.
  // Como los arrays empiezan en 0, restamos 1.
  const originalUrl = originalUrls[shortUrl - 1];

  if (originalUrl) {
    // Si encontramos la URL en nuestra "base de datos", redirigimos al usuario
    res.redirect(originalUrl);
  } else {
    // Si no existe una URL para ese número, devolvemos un error
    res.json({ error: 'No short URL found for the given input' });
  }
});

// --- FIN DEL CÓDIGO AÑADIDO ---


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});