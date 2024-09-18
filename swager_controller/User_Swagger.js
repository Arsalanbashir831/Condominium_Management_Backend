const axios = require('axios');


const API_URL = `${process.env.END_POINT_SWAGGER}/persona?CondGendID=1&FiltroSubentri=5`;

const fetchUsers = async (req, res) => {
  const searchQuery = req.query.searchQuery;

  try {
    let url = API_URL;

    if (searchQuery) {
      url += `&SearchQuery=${encodeURIComponent(searchQuery)}`;
    }

    const response = await axios.get(url,{
        headers: {
            'X-DANEA-API-KEY': process.env.TOKEN,
          }
    });
    const data = response.data;

    const mappedData = data.map(user => ({
      title: user.titolo,
      description: user.descr,
      address: user.indirizzo,
      postalCode: user.cap,
      city: user.citta,
      province: user.prov,
      country: user.nazione,
      shippingDescription: user.spedDesc,
      shippingAddress: user.spedIndirizzo,
      shippingPostalCode: user.spedCap,
      shippingCity: user.spedCitta,
      shippingProvince: user.spedProv,
      shippingCountry: user.spedNazione,
      taxCode: user.codFisc,
      vatNumber: user.piva,
      phone1: user.tel1,
      phone2: user.tel2,
      phone3: user.tel3,
      phone1Description: user.descTel1,
      phone2Description: user.descTel2,
      phone3Description: user.descTel3,
      fax: user.fax,
      email: user.email,
      notes: user.note,
      website: user.indirizzoWeb,
      paymentPreferenceInstallments: user.preferenzaPagamentoRate,
      shippingCategory: user.categoriaSpediz,
      pec: user.pec,
      preferredDeliveryTypeRegistered: user.preferenzaTipoInvioRacc,
      preferredDeliveryTypePriority: user.preferenzaTipoInvioPrior
    }));

    res.json(mappedData);
  } catch (error) {
  
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
module.exports={
    fetchUsers
}