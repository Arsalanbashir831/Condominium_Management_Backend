
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/DBconnection').sequelize;
const Condominium = require('./Condominium'); 

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    apartment: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    CondominiumId: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: Condominium,
            key: 'id',
        },
        allowNull: false,
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    timestamps: false,
});


User.ensureDefaults = async () => {
    const defaults = [{"id":2,"email":"luca.rossi@mail.com","name":"Luca","surname":"Rossi","apartment":"A1","contactNumber":"+39 340 1234567","createdAt":"2024-09-14 08:04:37.535+00","CondominiumId":1},{"id":3,"email":"marco.bianchi@mail.com","name":"Marco","surname":"Bianchi","apartment":"A2","contactNumber":"+39 340 2345678","createdAt":"2024-09-14 08:04:37.536+00","CondominiumId":1},{"id":4,"email":"elena.verdi@mail.com","name":"Elena","surname":"Verdi","apartment":"A3","contactNumber":"+39 340 3456789","createdAt":"2024-09-14 08:04:37.536+00","CondominiumId":1},{"id":5,"email":"giulia.neri@mail.com","name":"Giulia","surname":"Neri","apartment":"A4","contactNumber":"+39 340 4567890","createdAt":"2024-09-14 08:04:37.536+00","CondominiumId":1},{"id":6,"email":"francesco.galli@mail.com","name":"Francesco","surname":"Galli","apartment":"A5","contactNumber":"+39 340 5678901","createdAt":"2024-09-14 08:04:37.536+00","CondominiumId":1},{"id":7,"email":"alessandra.colombo@mail.com","name":"Alessandra","surname":"Colombo","apartment":"A6","contactNumber":"+39 340 6789012","createdAt":"2024-09-14 08:04:37.537+00","CondominiumId":1},{"id":8,"email":"fabio.rizzo@mail.com","name":"Fabio","surname":"Rizzo","apartment":"A7","contactNumber":"+39 340 7890123","createdAt":"2024-09-14 08:04:37.537+00","CondominiumId":1},{"id":9,"email":"marta.esposito@mail.com","name":"Marta","surname":"Esposito","apartment":"A8","contactNumber":"+39 340 8901234","createdAt":"2024-09-14 08:04:37.537+00","CondominiumId":1},{"id":10,"email":"giorgio.sorrentino@mail.com","name":"Giorgio","surname":"Sorrentino","apartment":"A9","contactNumber":"+39 340 9012345","createdAt":"2024-09-14 08:04:37.537+00","CondominiumId":1},{"id":11,"email":"sara.ferrari@mail.com","name":"Sara","surname":"Ferrari","apartment":"A10","contactNumber":"+39 340 0123456","createdAt":"2024-09-14 08:04:37.537+00","CondominiumId":1},{"id":12,"email":"paolo.russo@mail.com","name":"Paolo","surname":"Russo","apartment":"B1","contactNumber":"+39 340 1234568","createdAt":"2024-09-14 08:04:37.537+00","CondominiumId":2},{"id":13,"email":"laura.romano@mail.com","name":"Laura","surname":"Romano","apartment":"B2","contactNumber":"+39 340 2345679","createdAt":"2024-09-14 08:04:37.537+00","CondominiumId":2},{"id":14,"email":"valentina.ricci@mail.com","name":"Valentina","surname":"Ricci","apartment":"B3","contactNumber":"+39 340 3456780","createdAt":"2024-09-14 08:04:37.537+00","CondominiumId":2},{"id":15,"email":"simone.moretti@mail.com","name":"Simone","surname":"Moretti","apartment":"B4","contactNumber":"+39 340 4567891","createdAt":"2024-09-14 08:04:37.537+00","CondominiumId":2},{"id":16,"email":"anna.bruno@mail.com","name":"Anna","surname":"Bruno","apartment":"B5","contactNumber":"+39 340 5678902","createdAt":"2024-09-14 08:04:37.537+00","CondominiumId":2},{"id":17,"email":"stefano.marini@mail.com","name":"Stefano","surname":"Marini","apartment":"B6","contactNumber":"+39 340 6789013","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":2},{"id":18,"email":"matteo.conti@mail.com","name":"Matteo","surname":"Conti","apartment":"B7","contactNumber":"+39 340 7890124","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":2},{"id":19,"email":"roberta.deluca@mail.com","name":"Roberta","surname":"De Luca","apartment":"B8","contactNumber":"+39 340 8901235","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":2},{"id":20,"email":"alberto.costa@mail.com","name":"Alberto","surname":"Costa","apartment":"B9","contactNumber":"+39 340 9012346","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":2},{"id":21,"email":"claudia.greco@mail.com","name":"Claudia","surname":"Greco","apartment":"B10","contactNumber":"+39 340 0123457","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":2},{"id":22,"email":"daniele.monti@mail.com","name":"Daniele","surname":"Monti","apartment":"C1","contactNumber":"+39 340 1234569","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":3},{"id":23,"email":"ilaria.sanna@mail.com","name":"Ilaria","surname":"Sanna","apartment":"C2","contactNumber":"+39 340 2345680","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":3},{"id":24,"email":"riccardo.damico@mail.com","name":"Riccardo","surname":"D'Amico","apartment":"C3","contactNumber":"+39 340 3456791","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":3},{"id":25,"email":"giovanna.barbieri@mail.com","name":"Giovanna","surname":"Barbieri","apartment":"C4","contactNumber":"+39 340 4567902","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":3},{"id":26,"email":"giuseppe.orlando@mail.com","name":"Giuseppe","surname":"Orlando","apartment":"C5","contactNumber":"+39 340 5678913","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":3},{"id":27,"email":"federica.fiore@mail.com","name":"Federica","surname":"Fiore","apartment":"C6","contactNumber":"+39 340 6789024","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":3},{"id":28,"email":"gabriele.testa@mail.com","name":"Gabriele","surname":"Testa","apartment":"C7","contactNumber":"+39 340 7890135","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":3},{"id":29,"email":"silvia.giordano@mail.com","name":"Silvia","surname":"Giordano","apartment":"C8","contactNumber":"+39 340 8901246","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":3},{"id":30,"email":"alessio.martini@mail.com","name":"Alessio","surname":"Martini","apartment":"C9","contactNumber":"+39 340 9012357","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":3},{"id":31,"email":"monica.rinaldi@mail.com","name":"Monica","surname":"Rinaldi","apartment":"C10","contactNumber":"+39 340 0123468","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":3},{"id":32,"email":"davide.vitali@mail.com","name":"Davide","surname":"Vitali","apartment":"D1","contactNumber":"+39 340 1234579","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":1},{"id":33,"email":"cristina.pellegrini@mail.com","name":"Cristina","surname":"Pellegrini","apartment":"D2","contactNumber":"+39 340 2345690","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":1},{"id":34,"email":"emanuele.grassi@mail.com","name":"Emanuele","surname":"Grassi","apartment":"D3","contactNumber":"+39 340 3456801","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":1},{"id":35,"email":"beatrice.fontana@mail.com","name":"Beatrice","surname":"Fontana","apartment":"D4","contactNumber":"+39 340 4567912","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":1},{"id":36,"email":"michele.serra@mail.com","name":"Michele","surname":"Serra","apartment":"D5","contactNumber":"+39 340 5678923","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":1},{"id":37,"email":"franca.piras@mail.com","name":"Franca","surname":"Piras","apartment":"D6","contactNumber":"+39 340 6789034","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":2},{"id":38,"email":"andrea.fabbri@mail.com","name":"Andrea","surname":"Fabbri","apartment":"D7","contactNumber":"+39 340 7890145","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":2},{"id":39,"email":"lucia.mancini@mail.com","name":"Lucia","surname":"Mancini","apartment":"D8","contactNumber":"+39 340 8901256","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":2},{"id":40,"email":"tommaso.lombardi@mail.com","name":"Tommaso","surname":"Lombardi","apartment":"D9","contactNumber":"+39 340 9012367","createdAt":"2024-09-14 08:04:37.538+00","CondominiumId":2},{"id":41,"email":"veronica.caruso@mail.com","name":"Veronica","surname":"Caruso","apartment":"D10","contactNumber":"+39 340 0123478","createdAt":"2024-09-14 08:04:37.539+00","CondominiumId":2},{"id":42,"email":"nicola.bernardi@mail.com","name":"Nicola","surname":"Bernardi","apartment":"E1","contactNumber":"+39 340 1234589","createdAt":"2024-09-14 08:04:37.539+00","CondominiumId":3},{"id":43,"email":"rosa.ferri@mail.com","name":"Rosa","surname":"Ferri","apartment":"E2","contactNumber":"+39 340 2345701","createdAt":"2024-09-14 08:04:37.539+00","CondominiumId":3},{"id":44,"email":"antonio.ruggiero@mail.com","name":"Antonio","surname":"Ruggiero","apartment":"E3","contactNumber":"+39 340 3456812","createdAt":"2024-09-14 08:04:37.539+00","CondominiumId":3},{"id":45,"email":"chiara.caputo@mail.com","name":"Chiara","surname":"Caputo","apartment":"E4","contactNumber":"+39 340 4567923","createdAt":"2024-09-14 08:04:37.539+00","CondominiumId":3},{"id":46,"email":"alfredo.leone@mail.com","name":"Alfredo","surname":"Leone","apartment":"E5","contactNumber":"+39 340 5678934","createdAt":"2024-09-14 08:04:37.539+00","CondominiumId":3},{"id":47,"email":"francesca.napoli@mail.com","name":"Francesca","surname":"Napoli","apartment":"E6","contactNumber":"+39 340 6789045","createdAt":"2024-09-14 08:04:37.539+00","CondominiumId":1},{"id":48,"email":"giorgia.sartori@mail.com","name":"Giorgia","surname":"Sartori","apartment":"E7","contactNumber":"+39 340 7890156","createdAt":"2024-09-14 08:04:37.539+00","CondominiumId":2},{"id":49,"email":"massimo.amato@mail.com","name":"Massimo","surname":"Amato","apartment":"E8","contactNumber":"+39 340 8901267","createdAt":"2024-09-14 08:04:37.539+00","CondominiumId":3},{"id":50,"email":"leonardo.benedetti@mail.com","name":"Leonardo","surname":"Benedetti","apartment":"E9","contactNumber":"+39 340 9012378","createdAt":"2024-09-14 08:04:37.539+00","CondominiumId":1},{"id":51,"email":"sabrina.longo@mail.com","name":"Sabrina","surname":"Longo","apartment":"E10","contactNumber":"+39 340 0123489","createdAt":"2024-09-14 08:04:37.539+00","CondominiumId":2}];

    for (const user of defaults) {
        try {
            const [userRecord, created] = await User.findOrCreate({
                where: { id: user.id },
                defaults: {
                    email: user.email,
                    name: user.name,
                    surname: user.surname,
                    apartment: user.apartment,
                    CondominiumId: user.CondominiumId,
                    contactNumber: user.contactNumber,
                    createdAt: user.createdAt ? new Date(user.createdAt) : null
                }
            });

            if (created) {
                console.log(`Created default User: ${user.name}`);
            } else {
                console.log(`User already exists: ${user.name}`);
            }
        } catch (error) {
            console.error(`Error creating User ${user.name}:`, error);
        }
    }
};

module.exports = User;
