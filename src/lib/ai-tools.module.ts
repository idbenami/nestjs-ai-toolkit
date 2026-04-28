import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { AiToolsExplorer } from './ai-tools.explorer';
import { AiToolsMetadataAccessor } from './ai-tools-metadata.accessor';
import { ToolRegistryService } from './tool-registry.service';

@Module({
	imports: [DiscoveryModule],
	providers: [AiToolsMetadataAccessor, AiToolsExplorer, ToolRegistryService],
	exports: [ToolRegistryService],
})
export class AiToolsModule {}
