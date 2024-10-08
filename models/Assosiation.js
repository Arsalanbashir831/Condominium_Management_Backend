const Technician = require('./Technician');
const Ticket = require('./Ticket');
const Condominium = require('./Condominium');
const User = require ('./Users');
const PrefCommunication = require('./PrefCommunication');
const Status = require('./Status');

User.belongsTo(Condominium, { foreignKey: 'CondominiumId'  , as:'condominium'});
Condominium.hasMany(User, { foreignKey: 'CondominiumId' , as:'user'});

Technician.belongsTo(Condominium, { foreignKey: 'CondominiumId' , as: 'condominiumTech',  });
Condominium.hasMany(Technician, { foreignKey: 'CondominiumId' , as: 'technicians', });

Ticket.belongsTo(Technician, { foreignKey: 'technicianId' , as: 'assigned_technicians', });
Technician.hasMany(Ticket, { foreignKey: 'technicianId' ,as:'tickets_assign'});

Technician.belongsTo(PrefCommunication, { foreignKey: 'PrefferedCommunication', as: 'prefCommunication' });
PrefCommunication.hasMany(Technician, { foreignKey: 'PrefferedCommunication', as: 'technicians' });
User.hasMany(Ticket, { foreignKey: 'userId', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Status.hasMany(Ticket, { foreignKey: 'statusId', as: 'ticket_status' });
Ticket.belongsTo(Status, { foreignKey: 'statusId', as: 'status' });


module.exports = { Technician, Ticket , User , Condominium };