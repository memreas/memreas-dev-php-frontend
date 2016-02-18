<?php
// This file was auto-generated from sdk-root/src/data/cloudhsm/2014-05-30/api-2.json
return [ 'version' => '2.0', 'metadata' => [ 'apiVersion' => '2014-05-30', 'endpointPrefix' => 'cloudhsm', 'jsonVersion' => '1.1', 'protocol' => 'json', 'serviceAbbreviation' => 'CloudHSM', 'serviceFullName' => 'Amazon CloudHSM', 'signatureVersion' => 'v4', 'targetPrefix' => 'CloudHsmFrontendService', ], 'operations' => [ 'CreateHapg' => [ 'name' => 'CreateHapg', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'CreateHapgRequest', ], 'output' => [ 'shape' => 'CreateHapgResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'CreateHsm' => [ 'name' => 'CreateHsm', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'CreateHsmRequest', 'locationName' => 'CreateHsmRequest', ], 'output' => [ 'shape' => 'CreateHsmResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'CreateLunaClient' => [ 'name' => 'CreateLunaClient', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'CreateLunaClientRequest', ], 'output' => [ 'shape' => 'CreateLunaClientResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'DeleteHapg' => [ 'name' => 'DeleteHapg', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'DeleteHapgRequest', ], 'output' => [ 'shape' => 'DeleteHapgResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'DeleteHsm' => [ 'name' => 'DeleteHsm', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'DeleteHsmRequest', 'locationName' => 'DeleteHsmRequest', ], 'output' => [ 'shape' => 'DeleteHsmResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'DeleteLunaClient' => [ 'name' => 'DeleteLunaClient', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'DeleteLunaClientRequest', ], 'output' => [ 'shape' => 'DeleteLunaClientResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'DescribeHapg' => [ 'name' => 'DescribeHapg', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'DescribeHapgRequest', ], 'output' => [ 'shape' => 'DescribeHapgResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'DescribeHsm' => [ 'name' => 'DescribeHsm', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'DescribeHsmRequest', ], 'output' => [ 'shape' => 'DescribeHsmResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'DescribeLunaClient' => [ 'name' => 'DescribeLunaClient', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'DescribeLunaClientRequest', ], 'output' => [ 'shape' => 'DescribeLunaClientResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'GetConfig' => [ 'name' => 'GetConfig', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'GetConfigRequest', ], 'output' => [ 'shape' => 'GetConfigResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'ListAvailableZones' => [ 'name' => 'ListAvailableZones', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'ListAvailableZonesRequest', ], 'output' => [ 'shape' => 'ListAvailableZonesResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'ListHapgs' => [ 'name' => 'ListHapgs', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'ListHapgsRequest', ], 'output' => [ 'shape' => 'ListHapgsResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'ListHsms' => [ 'name' => 'ListHsms', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'ListHsmsRequest', ], 'output' => [ 'shape' => 'ListHsmsResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'ListLunaClients' => [ 'name' => 'ListLunaClients', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'ListLunaClientsRequest', ], 'output' => [ 'shape' => 'ListLunaClientsResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'ModifyHapg' => [ 'name' => 'ModifyHapg', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'ModifyHapgRequest', ], 'output' => [ 'shape' => 'ModifyHapgResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'ModifyHsm' => [ 'name' => 'ModifyHsm', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'ModifyHsmRequest', 'locationName' => 'ModifyHsmRequest', ], 'output' => [ 'shape' => 'ModifyHsmResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], [ 'shape' => 'CloudHsmInternalException', 'exception' => true, 'fault' => true, ], [ 'shape' => 'InvalidRequestException', 'exception' => true, ], ], ], 'ModifyLunaClient' => [ 'name' => 'ModifyLunaClient', 'http' => [ 'method' => 'POST', 'requestUri' => '/', ], 'input' => [ 'shape' => 'ModifyLunaClientRequest', ], 'output' => [ 'shape' => 'ModifyLunaClientResponse', ], 'errors' => [ [ 'shape' => 'CloudHsmServiceException', 'exception' => true, ], ], ], ], 'shapes' => [ 'AZ' => [ 'type' => 'string', 'pattern' => '[a-zA-Z0-9\\-]*', ], 'AZList' => [ 'type' => 'list', 'member' => [ 'shape' => 'AZ', ], ], 'Boolean' => [ 'type' => 'boolean', ], 'Certificate' => [ 'type' => 'string', 'max' => 2400, 'min' => 600, 'pattern' => '[\\w :+=./\\n-]*', ], 'CertificateFingerprint' => [ 'type' => 'string', 'pattern' => '([0-9a-fA-F][0-9a-fA-F]:){15}[0-9a-fA-F][0-9a-fA-F]', ], 'ClientArn' => [ 'type' => 'string', 'pattern' => 'arn:aws(-iso)?:cloudhsm:[a-zA-Z0-9\\-]*:[0-9]{12}:client-[0-9a-f]{8}', ], 'ClientLabel' => [ 'type' => 'string', 'pattern' => '[a-zA-Z0-9_.-]{2,64}', ], 'ClientList' => [ 'type' => 'list', 'member' => [ 'shape' => 'ClientArn', ], ], 'ClientToken' => [ 'type' => 'string', 'pattern' => '[a-zA-Z0-9]{1,64}', ], 'ClientVersion' => [ 'type' => 'string', 'enum' => [ '5.1', '5.3', ], ], 'CloudHsmInternalException' => [ 'type' => 'structure', 'members' => [], 'exception' => true, 'fault' => true, ], 'CloudHsmObjectState' => [ 'type' => 'string', 'enum' => [ 'READY', 'UPDATING', 'DEGRADED', ], ], 'CloudHsmServiceException' => [ 'type' => 'structure', 'members' => [ 'message' => [ 'shape' => 'String', ], 'retryable' => [ 'shape' => 'Boolean', ], ], 'exception' => true, ], 'CreateHapgRequest' => [ 'type' => 'structure', 'required' => [ 'Label', ], 'members' => [ 'Label' => [ 'shape' => 'Label', ], ], ], 'CreateHapgResponse' => [ 'type' => 'structure', 'members' => [ 'HapgArn' => [ 'shape' => 'HapgArn', ], ], ], 'CreateHsmRequest' => [ 'type' => 'structure', 'required' => [ 'SubnetId', 'SshKey', 'IamRoleArn', 'SubscriptionType', ], 'members' => [ 'SubnetId' => [ 'shape' => 'SubnetId', 'locationName' => 'SubnetId', ], 'SshKey' => [ 'shape' => 'SshKey', 'locationName' => 'SshKey', ], 'EniIp' => [ 'shape' => 'IpAddress', 'locationName' => 'EniIp', ], 'IamRoleArn' => [ 'shape' => 'IamRoleArn', 'locationName' => 'IamRoleArn', ], 'ExternalId' => [ 'shape' => 'ExternalId', 'locationName' => 'ExternalId', ], 'SubscriptionType' => [ 'shape' => 'SubscriptionType', 'locationName' => 'SubscriptionType', ], 'ClientToken' => [ 'shape' => 'ClientToken', 'locationName' => 'ClientToken', ], 'SyslogIp' => [ 'shape' => 'IpAddress', 'locationName' => 'SyslogIp', ], ], 'locationName' => 'CreateHsmRequest', ], 'CreateHsmResponse' => [ 'type' => 'structure', 'members' => [ 'HsmArn' => [ 'shape' => 'HsmArn', ], ], ], 'CreateLunaClientRequest' => [ 'type' => 'structure', 'required' => [ 'Certificate', ], 'members' => [ 'Label' => [ 'shape' => 'ClientLabel', ], 'Certificate' => [ 'shape' => 'Certificate', ], ], ], 'CreateLunaClientResponse' => [ 'type' => 'structure', 'members' => [ 'ClientArn' => [ 'shape' => 'ClientArn', ], ], ], 'DeleteHapgRequest' => [ 'type' => 'structure', 'required' => [ 'HapgArn', ], 'members' => [ 'HapgArn' => [ 'shape' => 'HapgArn', ], ], ], 'DeleteHapgResponse' => [ 'type' => 'structure', 'required' => [ 'Status', ], 'members' => [ 'Status' => [ 'shape' => 'String', ], ], ], 'DeleteHsmRequest' => [ 'type' => 'structure', 'required' => [ 'HsmArn', ], 'members' => [ 'HsmArn' => [ 'shape' => 'HsmArn', 'locationName' => 'HsmArn', ], ], 'locationName' => 'DeleteHsmRequest', ], 'DeleteHsmResponse' => [ 'type' => 'structure', 'required' => [ 'Status', ], 'members' => [ 'Status' => [ 'shape' => 'String', ], ], ], 'DeleteLunaClientRequest' => [ 'type' => 'structure', 'required' => [ 'ClientArn', ], 'members' => [ 'ClientArn' => [ 'shape' => 'ClientArn', ], ], ], 'DeleteLunaClientResponse' => [ 'type' => 'structure', 'required' => [ 'Status', ], 'members' => [ 'Status' => [ 'shape' => 'String', ], ], ], 'DescribeHapgRequest' => [ 'type' => 'structure', 'required' => [ 'HapgArn', ], 'members' => [ 'HapgArn' => [ 'shape' => 'HapgArn', ], ], ], 'DescribeHapgResponse' => [ 'type' => 'structure', 'members' => [ 'HapgArn' => [ 'shape' => 'HapgArn', ], 'HapgSerial' => [ 'shape' => 'String', ], 'HsmsLastActionFailed' => [ 'shape' => 'HsmList', ], 'HsmsPendingDeletion' => [ 'shape' => 'HsmList', ], 'HsmsPendingRegistration' => [ 'shape' => 'HsmList', ], 'Label' => [ 'shape' => 'Label', ], 'LastModifiedTimestamp' => [ 'shape' => 'Timestamp', ], 'PartitionSerialList' => [ 'shape' => 'PartitionSerialList', ], 'State' => [ 'shape' => 'CloudHsmObjectState', ], ], ], 'DescribeHsmRequest' => [ 'type' => 'structure', 'members' => [ 'HsmArn' => [ 'shape' => 'HsmArn', ], 'HsmSerialNumber' => [ 'shape' => 'HsmSerialNumber', ], ], ], 'DescribeHsmResponse' => [ 'type' => 'structure', 'members' => [ 'HsmArn' => [ 'shape' => 'HsmArn', ], 'Status' => [ 'shape' => 'HsmStatus', ], 'StatusDetails' => [ 'shape' => 'String', ], 'AvailabilityZone' => [ 'shape' => 'AZ', ], 'EniId' => [ 'shape' => 'EniId', ], 'EniIp' => [ 'shape' => 'IpAddress', ], 'SubscriptionType' => [ 'shape' => 'SubscriptionType', ], 'SubscriptionStartDate' => [ 'shape' => 'Timestamp', ], 'SubscriptionEndDate' => [ 'shape' => 'Timestamp', ], 'VpcId' => [ 'shape' => 'VpcId', ], 'SubnetId' => [ 'shape' => 'SubnetId', ], 'IamRoleArn' => [ 'shape' => 'IamRoleArn', ], 'SerialNumber' => [ 'shape' => 'HsmSerialNumber', ], 'VendorName' => [ 'shape' => 'String', ], 'HsmType' => [ 'shape' => 'String', ], 'SoftwareVersion' => [ 'shape' => 'String', ], 'SshPublicKey' => [ 'shape' => 'SshKey', ], 'SshKeyLastUpdated' => [ 'shape' => 'Timestamp', ], 'ServerCertUri' => [ 'shape' => 'String', ], 'ServerCertLastUpdated' => [ 'shape' => 'Timestamp', ], 'Partitions' => [ 'shape' => 'PartitionList', ], ], ], 'DescribeLunaClientRequest' => [ 'type' => 'structure', 'members' => [ 'ClientArn' => [ 'shape' => 'ClientArn', ], 'CertificateFingerprint' => [ 'shape' => 'CertificateFingerprint', ], ], ], 'DescribeLunaClientResponse' => [ 'type' => 'structure', 'members' => [ 'ClientArn' => [ 'shape' => 'ClientArn', ], 'Certificate' => [ 'shape' => 'Certificate', ], 'CertificateFingerprint' => [ 'shape' => 'CertificateFingerprint', ], 'LastModifiedTimestamp' => [ 'shape' => 'Timestamp', ], 'Label' => [ 'shape' => 'Label', ], ], ], 'EniId' => [ 'type' => 'string', 'pattern' => 'eni-[0-9a-f]{8}', ], 'ExternalId' => [ 'type' => 'string', 'pattern' => '[\\w :+=./-]*', ], 'GetConfigRequest' => [ 'type' => 'structure', 'required' => [ 'ClientArn', 'ClientVersion', 'HapgList', ], 'members' => [ 'ClientArn' => [ 'shape' => 'ClientArn', ], 'ClientVersion' => [ 'shape' => 'ClientVersion', ], 'HapgList' => [ 'shape' => 'HapgList', ], ], ], 'GetConfigResponse' => [ 'type' => 'structure', 'members' => [ 'ConfigType' => [ 'shape' => 'String', ], 'ConfigFile' => [ 'shape' => 'String', ], 'ConfigCred' => [ 'shape' => 'String', ], ], ], 'HapgArn' => [ 'type' => 'string', 'pattern' => 'arn:aws(-iso)?:cloudhsm:[a-zA-Z0-9\\-]*:[0-9]{12}:hapg-[0-9a-f]{8}', ], 'HapgList' => [ 'type' => 'list', 'member' => [ 'shape' => 'HapgArn', ], ], 'HsmArn' => [ 'type' => 'string', 'pattern' => 'arn:aws(-iso)?:cloudhsm:[a-zA-Z0-9\\-]*:[0-9]{12}:hsm-[0-9a-f]{8}', ], 'HsmList' => [ 'type' => 'list', 'member' => [ 'shape' => 'HsmArn', ], ], 'HsmSerialNumber' => [ 'type' => 'string', 'pattern' => '\\d{1,16}', ], 'HsmStatus' => [ 'type' => 'string', 'enum' => [ 'PENDING', 'RUNNING', 'UPDATING', 'SUSPENDED', 'TERMINATING', 'TERMINATED', 'DEGRADED', ], ], 'IamRoleArn' => [ 'type' => 'string', 'pattern' => 'arn:aws(-iso)?:iam::[0-9]{12}:role/[a-zA-Z0-9_\\+=,\\.\\-@]{1,64}', ], 'InvalidRequestException' => [ 'type' => 'structure', 'members' => [], 'exception' => true, ], 'IpAddress' => [ 'type' => 'string', 'pattern' => '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', ], 'Label' => [ 'type' => 'string', 'pattern' => '[a-zA-Z0-9_.-]{1,64}', ], 'ListAvailableZonesRequest' => [ 'type' => 'structure', 'members' => [], ], 'ListAvailableZonesResponse' => [ 'type' => 'structure', 'members' => [ 'AZList' => [ 'shape' => 'AZList', ], ], ], 'ListHapgsRequest' => [ 'type' => 'structure', 'members' => [ 'NextToken' => [ 'shape' => 'PaginationToken', ], ], ], 'ListHapgsResponse' => [ 'type' => 'structure', 'required' => [ 'HapgList', ], 'members' => [ 'HapgList' => [ 'shape' => 'HapgList', ], 'NextToken' => [ 'shape' => 'PaginationToken', ], ], ], 'ListHsmsRequest' => [ 'type' => 'structure', 'members' => [ 'NextToken' => [ 'shape' => 'PaginationToken', ], ], ], 'ListHsmsResponse' => [ 'type' => 'structure', 'members' => [ 'HsmList' => [ 'shape' => 'HsmList', ], 'NextToken' => [ 'shape' => 'PaginationToken', ], ], ], 'ListLunaClientsRequest' => [ 'type' => 'structure', 'members' => [ 'NextToken' => [ 'shape' => 'PaginationToken', ], ], ], 'ListLunaClientsResponse' => [ 'type' => 'structure', 'required' => [ 'ClientList', ], 'members' => [ 'ClientList' => [ 'shape' => 'ClientList', ], 'NextToken' => [ 'shape' => 'PaginationToken', ], ], ], 'ModifyHapgRequest' => [ 'type' => 'structure', 'required' => [ 'HapgArn', ], 'members' => [ 'HapgArn' => [ 'shape' => 'HapgArn', ], 'Label' => [ 'shape' => 'Label', ], 'PartitionSerialList' => [ 'shape' => 'PartitionSerialList', ], ], ], 'ModifyHapgResponse' => [ 'type' => 'structure', 'members' => [ 'HapgArn' => [ 'shape' => 'HapgArn', ], ], ], 'ModifyHsmRequest' => [ 'type' => 'structure', 'required' => [ 'HsmArn', ], 'members' => [ 'HsmArn' => [ 'shape' => 'HsmArn', 'locationName' => 'HsmArn', ], 'SubnetId' => [ 'shape' => 'SubnetId', 'locationName' => 'SubnetId', ], 'EniIp' => [ 'shape' => 'IpAddress', 'locationName' => 'EniIp', ], 'IamRoleArn' => [ 'shape' => 'IamRoleArn', 'locationName' => 'IamRoleArn', ], 'ExternalId' => [ 'shape' => 'ExternalId', 'locationName' => 'ExternalId', ], 'SyslogIp' => [ 'shape' => 'IpAddress', 'locationName' => 'SyslogIp', ], ], 'locationName' => 'ModifyHsmRequest', ], 'ModifyHsmResponse' => [ 'type' => 'structure', 'members' => [ 'HsmArn' => [ 'shape' => 'HsmArn', ], ], ], 'ModifyLunaClientRequest' => [ 'type' => 'structure', 'required' => [ 'ClientArn', 'Certificate', ], 'members' => [ 'ClientArn' => [ 'shape' => 'ClientArn', ], 'Certificate' => [ 'shape' => 'Certificate', ], ], ], 'ModifyLunaClientResponse' => [ 'type' => 'structure', 'members' => [ 'ClientArn' => [ 'shape' => 'ClientArn', ], ], ], 'PaginationToken' => [ 'type' => 'string', 'pattern' => '[a-zA-Z0-9+/]*', ], 'PartitionArn' => [ 'type' => 'string', 'pattern' => 'arn:aws(-iso)?:cloudhsm:[a-zA-Z0-9\\-]*:[0-9]{12}:hsm-[0-9a-f]{8}/partition-[0-9]{6,12}', ], 'PartitionList' => [ 'type' => 'list', 'member' => [ 'shape' => 'PartitionArn', ], ], 'PartitionSerial' => [ 'type' => 'string', 'pattern' => '\\d{9}', ], 'PartitionSerialList' => [ 'type' => 'list', 'member' => [ 'shape' => 'PartitionSerial', ], ], 'SshKey' => [ 'type' => 'string', 'pattern' => '[a-zA-Z0-9+/= ._:\\\\@-]*', ], 'String' => [ 'type' => 'string', 'pattern' => '[\\w :+=./\\\\-]*', ], 'SubnetId' => [ 'type' => 'string', 'pattern' => 'subnet-[0-9a-f]{8}', ], 'SubscriptionType' => [ 'type' => 'string', 'enum' => [ 'PRODUCTION', ], ], 'Timestamp' => [ 'type' => 'string', 'pattern' => '\\d*', ], 'VpcId' => [ 'type' => 'string', 'pattern' => 'vpc-[0-9a-f]{8}', ], ],];
