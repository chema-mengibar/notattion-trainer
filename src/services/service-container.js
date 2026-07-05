import ConfigService from './config-service';
import TrainerService from './trainer-service';

const configService = new ConfigService();
const trainerService = new TrainerService(configService);

export default {
  configService,
  trainerService,
};
