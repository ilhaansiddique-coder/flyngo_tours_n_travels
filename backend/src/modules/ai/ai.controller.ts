import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('recommendations')
  @Public()
  @ApiOperation({ summary: 'Get AI travel recommendations' })
  async getRecommendations(@Body() body: {
    budget?: number;
    duration?: number;
    interests?: string[];
    season?: string;
  }) {
    return this.aiService.getTravelRecommendations(body);
  }

  @Post('visa-assistance')
  @Public()
  @ApiOperation({ summary: 'Get AI visa assistance' })
  async getVisaAssistance(@Body() body: { destination: string; nationality: string }) {
    return this.aiService.getVisaAssistance(body.destination, body.nationality);
  }

  @Post('plan-itinerary')
  @Public()
  @ApiOperation({ summary: 'Plan itinerary with AI' })
  async planItinerary(@Body() body: {
    destination: string;
    days: number;
    budget: number;
    interests: string[];
  }) {
    return this.aiService.planItinerary(body);
  }

  @Post('umrah-itinerary')
  @Public()
  @ApiOperation({ summary: 'AI-built Umrah itinerary honoring Makkah/Madinah-first route, walking distance, elderly/children' })
  async umrahItinerary(@Body() body: {
    nights: number;
    makkahNights: number;
    madinahNights: number;
    startDate?: string;
    route: 'makkah_first' | 'madinah_first' | 'combined';
    travelers: number;
    hasChildren?: boolean;
    hasElderly?: boolean;
    budgetTier?: 'economy' | 'standard' | 'premium' | 'vip';
    walkingMax?: number;
    language?: 'en' | 'bn' | 'ur' | 'ar';
  }) {
    return this.aiService.planUmrahItinerary(body);
  }
}
