import {
	Body,
	Controller,
	InternalServerErrorException,
	Post,
} from '@nestjs/common'
import { SecretService, WalletService, CommunicationService } from '@services'
import { ReceiveShareDto, CreateWalletDto } from '@dtos'

@Controller('communication')
export class CommunicationController {
	constructor(
		private secretService: SecretService,
		private walletService: WalletService,
		private communicationService: CommunicationService
	) {}

	@Post('initialize-secret')
	async initializeSecret(@Body() data: { owner: string }): Promise<string> {
		try {
			const publicKey = await this.secretService.initialize(data.owner)
			return publicKey
		} catch (error) {
			console.error(error.message)
			throw new InternalServerErrorException(
				'Error when secretService.initialize'
			)
		}
	}

	@Post('generate-shares')
	async generateShares(@Body() data: { owner: string }): Promise<void> {
		try {
			await this.communicationService.generateShares(data.owner)
		} catch (error) {
			console.error(error.message)
			throw new InternalServerErrorException(
				'Error when communicationService.generateShares'
			)
		}
	}

	@Post('receive-share')
	async receiveShare(@Body() data: ReceiveShareDto): Promise<void> {
		try {
			await this.secretService.receiveShare(
				data.owner,
				data.receivedShare
			)
		} catch (error) {
			console.error(error.message)
			throw new InternalServerErrorException(
				'Error when secretService.receiveShare'
			)
		}
	}

	@Post('derive-master-share')
	async deriveMasterShare(@Body() data: { owner: string }): Promise<void> {
		try {
			await this.secretService.deriveMasterShare(data.owner)
		} catch (error) {
			console.error(error.message)
			throw new InternalServerErrorException(
				'Error when secretService.deriveMasterShare'
			)
		}
	}

	@Post('create-wallet')
	async createWallet(@Body() data: CreateWalletDto): Promise<void> {
		try {
			await this.walletService.create(
				data.owner,
				data.publicKey,
				data.address
			)
		} catch (error) {
			console.error(error.message)
			throw new InternalServerErrorException(
				'Error when walletService.create'
			)
		}
	}
}
