
const axios = require('axios');

const API_URL = `${process.env.END_POINT_SWAGGER}/fornitore`;

const fetchTechnician = async (req, res) => {
  const { searchQuery } = req.query;
  try {

    const url = searchQuery
      ? `${API_URL}?Attivi=true&DatiIncompleti=true&SearchQuery=${encodeURIComponent(searchQuery)}`
      : `${API_URL}?Attivi=true&DatiIncompleti=true`;


    const response = await axios.get(url, {
      headers: {
        'accept': 'application/json',
        'x-api-version': '1.0',
        'X-DANEA-API-KEY': process.env.TOKEN
      }
    });

    const data = response.data;

    const mappedData = data.map(supplier => ({
      description: supplier.descr,
      address: supplier.indirizzo,
      postalCode: supplier.cap,
      city: supplier.citta,
      province: supplier.prov,
      country: supplier.nazione,
      shippingDescription: supplier.spedDesc,
      shippingAddress: supplier.spedIndirizzo,
      shippingPostalCode: supplier.spedCap,
      shippingCity: supplier.spedCitta,
      shippingProvince: supplier.spedProv,
      shippingCountry: supplier.spedNazione,
      taxCode: supplier.codFisc,
      vatNumber: supplier.piva,
      phone1: supplier.tel1,
      phone2: supplier.tel2,
      phone3: supplier.tel3,
      phoneDescription1: supplier.descTel1,
      phoneDescription2: supplier.descTel2,
      phoneDescription3: supplier.descTel3,
      fax: supplier.fax,
      email: supplier.email,
      notes: supplier.note,
      activity: supplier.fornitoreAttivita,
      payment: supplier.fornitorePagamento,
      bank: supplier.banca,
      iban: supplier.iban,
      bic: supplier.bic,
      isTaxRegistered: supplier.fornitoreAnagrTributaria,
      firstName: supplier.fornitoreNome,
      lastName: supplier.fornitoreCognome,
      birthDate: supplier.fornitoreNascData,
      birthCity: supplier.fornitoreNascComune,
      birthProvince: supplier.fornitoreNascProv,
      homeAddress: supplier.domicIndirizzo,
      homePostalCode: supplier.domicCap,
      homeCity: supplier.domicCitta,
      homeProvince: supplier.domicProv,
      homeCountry: supplier.domicNazione,
      website: supplier.indirizzoWeb,
      f24TributeCode: supplier.f24CodTributo,
      contactPerson: supplier.fornitoreReferente,
      chamberOfCommerce: supplier.fornitoreCciaa,
      inail: supplier.fornitoreInail,
      inps: supplier.fornitoreInps,
      register: supplier.fornitoreAlbo,
      causativePoint: supplier.causalePunto18770,
      communicationLanguage: supplier.linguaComunicazioni,
      shippingCategory: supplier.categoriaSpediz,
      isInactive: supplier.fornitoreInattivo,
      pec: supplier.pec,
      preferredCollectionMethod: supplier.preferenzaTipoInvioRacc,
      preferredPriorityMethod: supplier.preferenzaTipoInvioPrior,
      isCopernicoDurcActive: supplier.attivaCopernicoDurc,
      isDurcActive: supplier.attivaDurc,
      durcStatus: supplier.statoDurc,
      durcStatusDescription: supplier.descStatoDurc,
      durcRequestDate: supplier.dataRichiestaDurc,
      durcExpirationDate: supplier.dataScadenzaDurc
    }));

    res.json(mappedData);
  } catch (error) {

    console.error('Error fetching supplier data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
module.exports={
    fetchTechnician
}