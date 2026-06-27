import { BadRequestException } from '@nestjs/common';
import { OrdemServicoPublicoController } from '../ordem-servico-publico.controller';
import { OrdemServicoService } from '../ordem-servico.service';

describe('OrdemServicoPublicoController', () => {
  let controller: OrdemServicoPublicoController;
  let service: { findByIdParaCliente: jest.Mock };

  beforeEach(() => {
    service = { findByIdParaCliente: jest.fn() };
    controller = new OrdemServicoPublicoController(
      service as unknown as OrdemServicoService,
    );
  });

  it('delega para o service informando o documento', async () => {
    service.findByIdParaCliente.mockResolvedValue({ osId: 'os-1' });

    const result = await controller.findOne('os-1', '11144477735');

    expect(service.findByIdParaCliente).toHaveBeenCalledWith(
      'os-1',
      '11144477735',
    );
    expect(result).toEqual({ osId: 'os-1' });
  });

  it('lança BadRequestException quando numDocumento ausente', () => {
    expect(() => controller.findOne('os-1', undefined)).toThrow(
      BadRequestException,
    );
    expect(service.findByIdParaCliente).not.toHaveBeenCalled();
  });

  it('lança BadRequestException quando numDocumento em branco', () => {
    expect(() => controller.findOne('os-1', '   ')).toThrow(
      BadRequestException,
    );
  });
});
