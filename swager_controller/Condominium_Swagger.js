
const axios = require('axios');
const API_URL = `${process.env.END_POINT_SWAGGER}/condominio`;

const fetchCondominium= async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'accept': 'application/json',
        'x-api-version': '1.0',
        'X-DANEA-API-KEY': process.env.TOKEN
      }
    });

    const data = response.data;

    const mappedData = data.map(condominium => ({
      header: condominium.intestazione,
      address: condominium.indirizzo,
      postalCode: condominium.cap,
      city: condominium.citta,
      province: condominium.prov,
      taxCode: condominium.codFisc,
      administrator: {
        name: condominium.amministratore.nome,
        subtitle: condominium.amministratore.sottotitolo,
        address: condominium.amministratore.indirizzo,
        postalCode: condominium.amministratore.cap,
        city: condominium.amministratore.citta,
        province: condominium.amministratore.prov,
        taxCode: condominium.amministratore.codfisc,
        vatNumber: condominium.amministratore.partiva,
        phone: condominium.amministratore.tel,
        fax: condominium.amministratore.fax,
        email: condominium.amministratore.email
      },
      id: condominium.id
    }));

    res.json(mappedData);
  } catch (error) {

    console.error('Error fetching condominium data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports={
    fetchCondominium
}

