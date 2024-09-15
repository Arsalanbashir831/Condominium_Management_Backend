const Technician = require('./Technician');
const Ticket = require('./Ticket');
const Condominium = require('./Condominium');
const User = require ('./Users');
const PrefCommunication = require('./PrefCommunication');

User.belongsTo(Condominium, { foreignKey: 'CondominiumId'  , as:'condominium'});
Condominium.hasMany(User, { foreignKey: 'CondominiumId' , as:'user'});

Technician.belongsTo(Condominium, { foreignKey: 'CondominiumId' , as: 'condominiumTech',  });
Condominium.hasMany(Technician, { foreignKey: 'CondominiumId' , as: 'technicians', });

Ticket.belongsTo(Technician, { foreignKey: 'TechnicianId' , as: 'assigned_technicians', });
Technician.hasMany(Ticket, { foreignKey: 'TechnicianId' ,as:'tickets_assign'});

Technician.belongsTo(PrefCommunication, { foreignKey: 'PrefferedCommunication', as: 'prefCommunication' });
PrefCommunication.hasMany(Technician, { foreignKey: 'PrefferedCommunication', as: 'technicians' });

User.hasMany(Ticket, { foreignKey: 'userId', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'user' });


module.exports = { Technician, Ticket , User , Condominium };