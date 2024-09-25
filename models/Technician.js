const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/DBconnection').sequelize;
const Condominium = require('./Condominium');
const PrefCommunication = require('./PrefCommunication');

const Technician = sequelize.define('Technician', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },  
    CompanyName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    SectorName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ContactNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    PrefferedCommunication: {
        type: DataTypes.INTEGER,
        references: {
            model: PrefCommunication,
            key: 'id'
        },
        allowNull: false
    },
    CondominiumId: { 
        type: DataTypes.INTEGER,
        references: {
            model: Condominium,
            key: 'id',
        },
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    timestamps: false,
});

Technician.ensureDefaults = async () => {
    const defaults = [{"id":9,"email":"info@elettroservice.it","CompanyName":"ElettroService S.r.l.","SectorName":"Elettricista","ContactNumber":"+39 333 1234567","createdAt":null,"CondominiumId":1,"PrefferedCommunication":2},{"id":10,"email":"mario.rossi@idraulici.it","CompanyName":"Mario Rossi - Idraulico","SectorName":"Idraulico","ContactNumber":"+39 333 2345678","createdAt":null,"CondominiumId":2,"PrefferedCommunication":1},{"id":11,"email":"contatti@ascensoriveloci.it","CompanyName":"Ascensori Veloci S.p.A.","SectorName":"Tecnico Ascensore","ContactNumber":"+39 333 3456789","createdAt":null,"CondominiumId":3,"PrefferedCommunication":2},{"id":12,"email":"info@termotech.it","CompanyName":"TermoTech S.n.c.","SectorName":"Tecnico Caldaie","ContactNumber":"+39 333 4567890","createdAt":null,"CondominiumId":1,"PrefferedCommunication":1},{"id":13,"email":"contatto@carpenteriamoderna.it","CompanyName":"Carpenteria Moderna","SectorName":"Carpentiere","ContactNumber":"+39 333 5678901","createdAt":"2024-09-14 07:56:44.479+00","CondominiumId":2,"PrefferedCommunication":2},{"id":14,"email":"luca.bianchi@fabbribianchi.it","CompanyName":"Fabbro Luca Bianchi","SectorName":"Fabbro","ContactNumber":"+39 333 6789012","createdAt":"2024-09-14 07:56:44.48+00","CondominiumId":3,"PrefferedCommunication":1},{"id":15,"email":"info@verdegarden.it","CompanyName":"Verde Garden S.r.l.","SectorName":"Giardiniere","ContactNumber":"+39 333 7890123","createdAt":"2024-09-14 07:56:44.48+00","CondominiumId":1,"PrefferedCommunication":2},{"id":16,"email":"contatti@pulizierapide.it","CompanyName":"Pulizie Rapide","SectorName":"Impresa di Pulizie","ContactNumber":"+39 333 8901234","createdAt":"2024-09-14 07:56:44.48+00","CondominiumId":2,"PrefferedCommunication":1},{"id":17,"email":"info@sicurezzadomestica.it","CompanyName":"Sicurezza Domestica","SectorName":"Sicurezza","ContactNumber":"+39 333 9012345","createdAt":"2024-09-14 07:56:44.48+00","CondominiumId":3,"PrefferedCommunication":2},{"id":18,"email":"paolo.verdi@elettricisti.it","CompanyName":"Elettricista Paolo Verdi","SectorName":"Elettricista","ContactNumber":"+39 333 0123456","createdAt":"2024-09-14 07:56:44.48+00","CondominiumId":1,"PrefferedCommunication":1},{"id":19,"email":"info@tinteggiaturecolorate.it","CompanyName":"Tinteggiature Colorate","SectorName":"Tinteggiatore","ContactNumber":"+39 333 1234568","createdAt":"2024-09-14 07:56:44.481+00","CondominiumId":2,"PrefferedCommunication":2},{"id":20,"email":"contatto@giardinifioriti.it","CompanyName":"Giardini Fioriti S.n.c.","SectorName":"Giardiniere","ContactNumber":"+39 333 2345679","createdAt":"2024-09-14 07:56:44.481+00","CondominiumId":3,"PrefferedCommunication":1},{"id":21,"email":"info@serramentieinfissi.it","CompanyName":"Serramenti e Infissi","SectorName":"Serramentista","ContactNumber":"+39 333 3456780","createdAt":"2024-09-14 07:56:44.481+00","CondominiumId":1,"PrefferedCommunication":2},{"id":22,"email":"contatti@climatizzazioneservice.it","CompanyName":"Climatizzazione Service","SectorName":"Tecnico Climatizzazione","ContactNumber":"+39 333 4567891","createdAt":"2024-09-14 07:56:44.481+00","CondominiumId":2,"PrefferedCommunication":1},{"id":23,"email":"info@impiantigialli.it","CompanyName":"Impianti Idraulici Gialli","SectorName":"Idraulico","ContactNumber":"+39 333 5678902","createdAt":"2024-09-14 07:56:44.481+00","CondominiumId":3,"PrefferedCommunication":2},{"id":24,"email":"franco.neri@antennisti.it","CompanyName":"Antennista Franco Neri","SectorName":"Antennista","ContactNumber":"+39 333 6789013","createdAt":"2024-09-14 07:56:44.481+00","CondominiumId":1,"PrefferedCommunication":1},{"id":25,"email":"info@riparazionimeccaniche.it","CompanyName":"Riparazioni Meccaniche S.r.l.","SectorName":"Meccanico","ContactNumber":"+39 333 7890124","createdAt":"2024-09-14 07:56:44.481+00","CondominiumId":2,"PrefferedCommunication":2},{"id":26,"email":"contatti@serratureinstall.it","CompanyName":"Installazioni Serrature","SectorName":"Serramentista","ContactNumber":"+39 333 8901235","createdAt":"2024-09-14 07:56:44.481+00","CondominiumId":3,"PrefferedCommunication":1},{"id":27,"email":"info@vetri-finestre.it","CompanyName":"Vetri e Finestre Moderni","SectorName":"Vetraio","ContactNumber":"+39 333 9012346","createdAt":"2024-09-14 07:56:44.481+00","CondominiumId":1,"PrefferedCommunication":2},{"id":28,"email":"info@riscaldamentiefficienti.it","CompanyName":"Riscaldamenti Efficienti S.p.A.","SectorName":"Tecnico Riscaldamenti","ContactNumber":"+39 333 0123457","createdAt":"2024-09-14 07:56:44.481+00","CondominiumId":2,"PrefferedCommunication":1},{"id":29,"email":"info@giardinipianteverdi.it","CompanyName":"Giardini e Piante Verdi","SectorName":"Giardiniere","ContactNumber":"+39 333 1234569","createdAt":"2024-09-14 07:56:44.481+00","CondominiumId":3,"PrefferedCommunication":2},{"id":30,"email":"luca.innocenti@mail.com","CompanyName":"Luca Innocenti","SectorName":"Idraulico","ContactNumber":"+39 3213432432","createdAt":null,"CondominiumId":1,"PrefferedCommunication":1},{"id":31,"email":"tommyitaconsulting@gmail.com","CompanyName":"tommosia","SectorName":"Elettricista","ContactNumber":"+39 333 1234567","createdAt":null,"CondominiumId":1,"PrefferedCommunication":2}];

    for (const tech of defaults) {
        try {
            const [techRecord, created] = await Technician.findOrCreate({
                where: { id: tech.id },
                defaults: {
                    email: tech.email,
                    CompanyName: tech.CompanyName,
                    SectorName: tech.SectorName,
                    ContactNumber: tech.ContactNumber,
                    CondominiumId: tech.CondominiumId,
                    PrefferedCommunication: tech.PrefferedCommunication,
                    createdAt: tech.createdAt ? new Date(tech.createdAt) : null
                }
            });

            if (created) {
                console.log(`Created default technician: ${tech.CompanyName}`);
            } else {
                console.log(`Technician already exists: ${tech.CompanyName}`);
            }
        } catch (error) {
            console.error(`Error creating technician ${tech.CompanyName}:`, error);
        }
    }
};

module.exports = Technician;